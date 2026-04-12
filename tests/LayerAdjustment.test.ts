/// <reference types="jest-playwright-preset" />

describe('Layer Adjustment Test', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
        await page.setViewportSize({ width: 1280, height: 800 });
        page.on('console', msg => console.log('BROWSER:', msg.text()));
    });

    test('should change rendering order when dragging infobox', async () => {
        console.log("Starting Layer Adjustment Test");
        await page.waitForSelector('#drawingViewport');
        const drawingViewport = await page.$('#drawingViewport');
        const drawingBox = await drawingViewport?.boundingBox();
        if (!drawingBox) throw new Error('Drawing viewport not found');

        // Clear canvas
        await page.click('#clearAll');
        try {
            await page.waitForSelector('.confirm-wrapper .accept', { timeout: 2000 });
            await page.click('.confirm-wrapper .accept');
            await page.waitForSelector('.confirm-wrapper', { state: 'hidden', timeout: 2000 });
        } catch (e) {}

        const centerX = drawingBox.x + drawingBox.width / 2;
        const centerY = drawingBox.y + drawingBox.height / 2;

        console.log("Step 1: Draw Rectangle");
        await page.click('#newRect');
        await page.mouse.move(centerX - 100, centerY - 100);
        await page.mouse.down();
        await page.mouse.move(centerX + 100, centerY + 100, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        console.log("Step 2: Draw Circle");
        await page.click('#newCircle');
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX + 50, centerY + 50, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        let initialSVGOrder = await page.evaluate(() => {
            const svg = document.querySelector('#drawingViewport svg');
            const children = Array.from(svg?.children || []).filter(c => c.tagName.toLowerCase() !== 'defs');
            return children.map(c => c.tagName.toLowerCase()).join(',');
        });
        console.log("Initial SVG elements:", initialSVGOrder);
        
        // Wait for infoboxes to appear
        await page.waitForSelector('.infobox');
        const infoBoxes = await page.$$('.infobox');
        expect(infoBoxes.length).toBe(2);

        const topBoxDragHandle = await infoBoxes[0].$('.drag-handle');
        const bottomBoxBounds = await infoBoxes[1].boundingBox();
        
        if (!topBoxDragHandle || !bottomBoxBounds) {
            throw new Error('Drag handle or bounds not found');
        }

        const handleBounds = await topBoxDragHandle.boundingBox();
        if (!handleBounds) throw new Error('Handle bounds not found');

        console.log("Dragging top infobox down");
        const startX = handleBounds.x + handleBounds.width / 2;
        const startY = handleBounds.y + handleBounds.height / 2;
        
        // Drag it down enough to swap with the next element
        const targetY = bottomBoxBounds.y + bottomBoxBounds.height / 2 + 10; 

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.move(startX, targetY, { steps: 10 });
        await page.waitForTimeout(200);
        await page.mouse.up();
        await page.waitForTimeout(500);

        let newSVGOrder = await page.evaluate(() => {
            const svg = document.querySelector('#drawingViewport svg');
            const children = Array.from(svg?.children || []).filter(c => c.tagName.toLowerCase() !== 'defs');
            return children.map(c => c.tagName.toLowerCase()).join(',');
        });
        console.log("New SVG elements:", newSVGOrder);

        expect(initialSVGOrder).not.toEqual(newSVGOrder);
    }, 60000);
});
