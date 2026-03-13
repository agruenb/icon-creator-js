/// <reference types="jest-playwright-preset" />

describe('Browser Mouse Interaction', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
        await page.setViewportSize({ width: 1280, height: 800 });
        page.on('console', msg => console.log('BROWSER:', msg.text()));
    });

    test('should move the mouse and interact with the canvas', async () => {
        // Wait for the app to load
        await page.waitForSelector('#viewport', { timeout: 10000 });

        // Move mouse to some position in the viewport
        const viewport = await page.$('#viewport');
        const box = await viewport?.boundingBox();
        if (!box) throw new Error('Viewport not found');

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        console.log(`Moving mouse to center: ${startX}, ${startY}`);
        await page.mouse.move(startX, startY);

        // Perform a click to focus or interact
        await page.mouse.down();

        // Drag mouse in a circle or square
        console.log('Performing mouse drag movement');
        await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 10 });
        await page.mouse.up();

        // Verify that the browser is still on the correct page
        expect(page.url()).toContain('localhost:3000');
    });

    test('should paint a complex icon with pattern tool, edit it, mask, and export', async () => {
        console.log("Starting Complex Interaction Test");
        await page.waitForSelector('#drawingViewport');
        const drawingViewport = await page.$('#drawingViewport');
        const drawingBox = await drawingViewport?.boundingBox();
        if (!drawingBox) throw new Error('Drawing viewport not found');

        console.log(`Drawing Viewport Box: x=${drawingBox.x}, y=${drawingBox.y}, w=${drawingBox.width}, h=${drawingBox.height}`);

        // Clear canvas
        await page.click('#clearAll');
        try {
            await page.waitForSelector('.confirm-wrapper .accept', { timeout: 2000 });
            await page.click('.confirm-wrapper .accept');
            await page.waitForSelector('.confirm-wrapper', { state: 'hidden', timeout: 2000 });
        } catch (e) {}

        console.log("Setting paint color via JS");
        await page.evaluate(() => {
            (window as any).manager.editor.currProj().frame().color = "#307ffd";
        });

        // Use coordinates relative to the drawing viewport center
        const centerX = drawingBox.x + drawingBox.width / 2;
        const centerY = drawingBox.y + drawingBox.height / 2;

        const startX = centerX - 100;
        const startY = centerY - 100;
        const endX = centerX + 100;
        const endY = centerY - 100;
        const midX = centerX;
        const midY = centerY + 100;

        console.log("Drawing Polygon Step 1: Drag");
        await page.click('#newPath');
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(200);

        console.log("Drawing Polygon Step 2: Click mid");
        await page.mouse.click(midX, midY);
        await page.waitForTimeout(200);

        console.log("Drawing Polygon Step 3: Close path");
        await page.mouse.click(startX, startY);
        await page.waitForTimeout(500);

        console.log("Waiting for path to be created in DOM");
        await page.waitForSelector('#drawingViewport path', { timeout: 10000 });

        console.log("Internal State Check before selection:");
        await page.evaluate(() => {
            const editor = (window as any).manager.editor;
            console.log(`Action: ${editor.state.currentAction}, Focused: ${editor.focusedPattern()?.id}`);
        });

        console.log("Selecting the path to show markers");
        await page.click('#cursor'); 
        await page.waitForTimeout(500);

        // Click on vertex to select
        console.log(`Clicking vertex at ${startX}, ${startY}`);
        await page.mouse.click(startX, startY);
        await page.waitForTimeout(1000);

        console.log("Waiting for path selection markers");
        await page.waitForSelector('img[src="img/point_marker.svg"]', { timeout: 10000 });

        console.log("Making edge sharp");
        const pointMarkers = await page.$$('img[src="img/point_marker.svg"]');
        if (pointMarkers.length > 0) {
            const box = await pointMarkers[0].boundingBox();
            if (box) {
                // Click the canvas at the marker's center
                await page.mouse.click(box.x + 8, box.y + 8);
                await page.waitForSelector('img[src="img/octagon_marker.svg"]', { timeout: 10000 });
            }
        }

        console.log("Adding a new point");
        const curveSelector = 'img[src="img/curve_marker.svg"]';
        await page.waitForSelector(curveSelector, { timeout: 10000 });
        const curveMarker = await page.locator(curveSelector).first();
        const curveBox = await curveMarker.boundingBox();
        if (curveBox) {
            await page.evaluate(() => {
                const editor = (window as any).manager.editor;
                console.log(`PRE-RIGHT-CLICK: Action=${editor.state.currentAction}, Focused=${editor.focusedPattern()?.id}`);
            });

            console.log(`Right clicking curve marker at ${curveBox.x + 8}, ${curveBox.y + 8} to add point`);
            
            // Check what element is at this point
            await page.evaluate(({x, y}: {x: number, y: number}) => {
                const el = document.elementFromPoint(x, y);
                console.log(`Element at points (${x}, ${y}): TAG=${el?.tagName}, ID=${el?.id}, PARENT_ID=${el?.parentElement?.id}, PARENT_ROLE=${el?.parentElement?.getAttribute('role')}`);
            }, {x: curveBox.x + 8, y: curveBox.y + 8});

            await page.mouse.click(curveBox.x + 8, curveBox.y + 8, { button: 'right' });
            
            await page.evaluate(() => {
                const editor = (window as any).manager.editor;
                console.log(`POST-RIGHT-CLICK: Action=${editor.state.currentAction}, Focused=${editor.focusedPattern()?.id}, ContextMenu=${!!editor.uiManager.contextMenu}`);
            });

            const addOption = page.locator('.contextmenu-button').filter({ hasText: 'add' }).first();
            await addOption.waitFor({ timeout: 10000 });
            await addOption.click();
            await page.waitForTimeout(500);

            console.log("Removing the point");
            // Find the curve marker again as it might have moved
            await page.waitForSelector(curveSelector, { timeout: 10000 });
            const curveBox2 = await page.locator(curveSelector).first().boundingBox();
            if (curveBox2) {
                await page.mouse.click(curveBox2.x + 8, curveBox2.y + 8, { button: 'right' });
                const removeOption = page.locator('.contextmenu-button').filter({ hasText: 'remove' }).first();
                await removeOption.waitFor({ timeout: 10000 });
                await removeOption.click();
            }
        }

        console.log("Adding and masking rect");
        await page.click('#newRect');
        // Drag a rectangle next to the path
        const rectStartX = centerX + 50;
        const rectStartY = centerY + 50;
        await page.mouse.move(rectStartX, rectStartY);
        await page.mouse.down();
        await page.mouse.move(rectStartX + 100, rectStartY + 100, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        console.log("Using banner for masking");
        await page.waitForSelector('.banner', { timeout: 10000 });
        const bannerCarveOut = page.locator('.banner .contextmenu-button').filter({ hasText: 'carve out' }).first();
        await bannerCarveOut.waitFor({ timeout: 10000 });
        await bannerCarveOut.click();

        console.log("Waiting for mask view banner (the yellow one)");
        await page.waitForSelector('.banner:has-text("Carve out mode")', { timeout: 10000 });
        
        console.log("Exporting");
        await page.click('#exportFile');
        await page.waitForSelector('.export-wrapper', { timeout: 10000 });

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('.download-button')
        ]);
        
        const filename = download.suggestedFilename();
        console.log(`Downloaded icon: ${filename}`);
        expect(filename).toMatch(/\.png$/);
        
        const [closeButton] = await page.$$('.export-wrapper .close-button');
        if (closeButton) await closeButton.click();
    }, 60000);
});
