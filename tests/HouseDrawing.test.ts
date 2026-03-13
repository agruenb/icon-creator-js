/// <reference types="jest-playwright-preset" />

describe('House Drawing Test', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
        await page.setViewportSize({ width: 1280, height: 800 });
        page.on('console', msg => console.log('BROWSER:', msg.text()));
    });

    test('should draw a simple house and export it', async () => {
        /**
         * The editor UI is centered around the #drawingViewport. 
         * All pattern coordinates are relative to the viewport's origin (0,0) in logic space,
         * but for Playwright we use screen coordinates relative to the #drawingViewport bounding box.
         */
        console.log("Starting House Drawing Test");
        await page.waitForSelector('#drawingViewport');
        const drawingViewport = await page.$('#drawingViewport');
        const drawingBox = await drawingViewport?.boundingBox();
        if (!drawingBox) throw new Error('Drawing viewport not found');

        // Clear canvas to ensure a clean state for the test
        await page.click('#clearAll');
        try {
            await page.waitForSelector('.confirm-wrapper .accept', { timeout: 2000 });
            await page.click('.confirm-wrapper .accept');
            await page.waitForSelector('.confirm-wrapper', { state: 'hidden', timeout: 2000 });
        } catch (e) {}

        const centerX = drawingBox.x + drawingBox.width / 2;
        const centerY = drawingBox.y + drawingBox.height / 2;

        /**
         * Step 1: Draw House Base (Rect)
         * We use the #newRect tool. Dragging from top-left to bottom-right creates the pattern.
         */
        console.log("Step 1: Draw House Base (Rect)");
        await page.click('#newRect');
        const baseWidth = 200;
        const baseHeight = 150;
        const baseStartX = centerX - baseWidth / 2;
        const baseStartY = centerY; 
        
        await page.mouse.move(baseStartX, baseStartY);
        await page.mouse.down();
        await page.mouse.move(baseStartX + baseWidth, baseStartY + baseHeight, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        /**
         * Step 2: Draw Roof (Path)
         * The #newPath tool uses a click-based sequence to add vertices.
         * Closing the path involves clicking the starting vertex again.
         */
        console.log("Step 2: Draw Roof (Path)");
        await page.click('#newPath');
        const roofPeakX = centerX;
        const roofPeakY = centerY - 100;
        const roofLeftX = baseStartX - 20;
        const roofLeftY = baseStartY;
        const roofRightX = baseStartX + baseWidth + 20;
        const roofRightY = baseStartY;

        await page.mouse.move(roofPeakX, roofPeakY);
        await page.mouse.down();
        await page.mouse.move(roofLeftX, roofLeftY, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(200);
        await page.mouse.click(roofRightX, roofRightY);
        await page.waitForTimeout(200);
        await page.mouse.click(roofPeakX, roofPeakY);
        await page.waitForTimeout(500);

        /**
         * Step 3: Add Detail (Cutout Window)
         * This demonstrates the "Carve Out" (Mask) mode.
         * A pattern must be focused (selected) to enter mask mode.
         * Patterns added WHILE in mask mode act as negative space (cutouts).
         */
        console.log("Step 3: Add Detail (Cutout Window)");
        // Select base using the cursor tool. 
        // We use .click({ force: true }) because the parent SVG sometimes intercepts pointer events.
        await page.click('#cursor');
        const houseBase = page.locator('#drawingViewport rect').last();
        
        let isFocused = false;
        for (let i = 0; i < 3; i++) {
            await houseBase.click({ force: true });
            await page.waitForTimeout(1000);
            isFocused = await page.evaluate(() => {
                const editor = (window as any).manager.editor;
                return editor.focusedPattern() !== undefined;
            });
            if (isFocused) break;
            console.log(`Focus attempt ${i + 1} failed, retrying...`);
        }
        
        if (!isFocused) {
            console.log("Failed to focus base pattern even with forced clicks. Taking screenshot.");
            await page.screenshot({ path: '/Users/adrian/Code/personal/icon-creator-js/house_fail_focus.png' });
            throw new Error("Failed to focus base pattern");
        }

        // Enter mask mode via the interactive banner that appears when a pattern is focused
        console.log("Entering mask mode");
        await page.waitForSelector('.banner', { timeout: 10000 });
        const bannerCarveOut = page.locator('.banner .contextmenu-button').filter({ hasText: 'carve out' }).first();
        await bannerCarveOut.click({ force: true });
        await page.waitForSelector('.banner:has-text("Carve out mode")', { timeout: 10000 });

        // Draw a window cutout (Rect) while in mask mode
        console.log("Drawing window cutout");
        await page.click('#newRect');
        const windowX = centerX - 30;
        const windowY = centerY + 30;
        await page.mouse.move(windowX, windowY);
        await page.mouse.down();
        await page.mouse.move(windowX + 60, windowY + 60, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(1000);

        /**
         * Deselecting the window to close its individual tool banner.
         * This is necessary because the editor shows a tool banner for any focused pattern,
         * which can obscure or intercept clicks on the main "Carve out mode" quit button.
         * We click the background of the drawing viewport.
         */
        console.log("Deselecting cutout pattern");
        await page.mouse.click(drawingBox.x + 10, drawingBox.y + 10);
        await page.waitForTimeout(1000);

        // Quit mask mode to return to global view
        console.log("Quitting mask mode");
        const quitButton = page.locator('.banner .close-button').filter({ hasText: 'Quit' }).first();
        await quitButton.click({ force: true });
        await page.waitForSelector('.banner:has-text("Carve out mode")', { state: 'hidden', timeout: 10000 });

        /**
         * Step 4: Export the resulting icon
         * Verifies the full workflow from creation to file generation.
         */
        console.log("Step 4: Export House Icon");
        await page.click('#exportFile');
        await page.waitForSelector('.export-wrapper', { timeout: 10000 });

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('.download-button')
        ]);
        
        const filename = download.suggestedFilename();
        console.log(`Downloaded house icon: ${filename}`);
        expect(filename).toMatch(/\.png$/);
        
        const [closeButton] = await page.$$('.export-wrapper .close-button');
        if (closeButton) await closeButton.click();
    }, 60000);
});
