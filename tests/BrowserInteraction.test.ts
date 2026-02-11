/// <reference types="jest-playwright-preset" />

describe('Browser Mouse Interaction', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
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
        await page.mouse.click(startX, startY);

        // Drag mouse in a circle or square
        console.log('Performing mouse drag movement');
        await page.mouse.move(startX + 50, startY, { steps: 10 });
        await page.mouse.down();
        await page.mouse.move(startX + 50, startY + 50, { steps: 10 });
        await page.mouse.move(startX - 50, startY + 50, { steps: 10 });
        await page.mouse.move(startX - 50, startY - 50, { steps: 10 });
        await page.mouse.move(startX + 50, startY - 50, { steps: 10 });
        await page.mouse.up();

        // Verify that the browser is still on the correct page
        expect(page.url()).toContain('localhost:3000');
    });
});
