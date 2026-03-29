/// <reference types="jest-playwright-preset" />

describe('Paint Bucket Tool Interaction', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
    });

    beforeEach(async () => {
        // Clear all before each test to have a clean state
        await page.click('#clearAll');
        try {
            await page.waitForSelector('.confirm-wrapper .accept', { timeout: 2000 });
            await page.click('.confirm-wrapper .accept');
            await page.waitForSelector('.confirm-wrapper', { state: 'hidden', timeout: 2000 });
        } catch (e) {
            // Ignore if no confirm window
        }
    }, 15000);

    test('should fill a shape with the selected color', async () => {
        // 1. Draw a rectangle
        await page.click('#newRect');
        const viewport = await page.$('#viewport');
        const viewportBox = await viewport?.boundingBox();
        if (!viewportBox) throw new Error('Viewport not found');

        const x = viewportBox.x + viewportBox.width / 2;
        const y = viewportBox.y + viewportBox.height / 2;
        
        // draw the rectangle
        await page.mouse.click(x, y);

        // Wait for rect to appear
        await page.waitForSelector('#drawingViewport rect');

        // Let the state settle
        await page.waitForTimeout(500);

        // 3. Change paint color via the color input inside #paintColor
        const newColor = '#ff0000';
        await page.$eval('#paintColor input', (el: HTMLInputElement, color) => {
            el.value = color;
            el.dispatchEvent(new Event('change'));
        }, newColor);
        
        // 4. Select Paint Bucket tool by clicking it
        // Note: tool selection listens on mousedown
        const paintColorBox = await page.$('#paintColor');
        const paintColorBoxBounds = await paintColorBox?.boundingBox();
        if(!paintColorBoxBounds) throw new Error('paintColor not found');
        
        await page.mouse.move(paintColorBoxBounds.x + 5, paintColorBoxBounds.y + 5);
        await page.mouse.down();
        await page.mouse.up();

        await page.waitForTimeout(100);

        // 5. Click the rectangle to fill it
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.up();

        await page.waitForTimeout(100);

        // 6. Verify the new color is applied directly to the shape in the viewport
        const shapeFill = await page.$eval('#drawingViewport rect', (el: SVGElement) => el.getAttribute('fill'));
        // If it's a solid fill, it should match the newColor
        expect(shapeFill?.toLowerCase()).toBe(newColor);
    }, 20000); // increase test timeout to 20 seconds
});
