/**
 * Bug Reproduction: InteractionManager TypeError
 * 
 * Error: Uncaught TypeError: can't access property "releaseActiveDraw", pattern is undefined
 * Location: InteractionManager.ts:handleMouseUp
 * 
 * Scenario:
 * 1. User selects a tool (e.g., Rectangle).
 * 2. User presses mouse down on the canvas.
 * 3. User moves the mouse very slightly.
 *    - In InteractionManager.ts:handleMouseMove, the action transitions to "mousedownPaintPattern" 
 *      and then to "activePaintPattern".
 *    - However, the pattern object is only instantiated in "activePaintPattern" AFTER a certain 
 *      movement threshold or specific event sequence is met within the next handleMouseMove calls.
 * 4. User releases the mouse button (handleMouseUp).
 *    - At this point, editor.state.currentAction is "activePaintPattern".
 *    - The code attempts to call pattern.releaseActiveDraw(...).
 *    - If the pattern object was not yet created, it crashes with TypeError.
 * 
 * Fix: Added a guard in handleMouseUp to check if pattern is undefined and fall back 
 * to the default pattern placement logic (same as a simple click).
 */
/// <reference types="jest-playwright-preset" />


describe('Bug Reproduction: InteractionManager TypeError', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
    });

    test('Reproduce pattern is undefined in handleMouseUp', async () => {
        // 1. Select a tool
        await page.waitForSelector('#newRect');
        await page.click('#newRect');

        // 2. Get viewport center
        const viewport = await page.$('#viewport');
        const viewportBox = await viewport?.boundingBox();
        if (!viewportBox) throw new Error('Viewport not found');

        const startX = viewportBox.x + viewportBox.width / 2;
        const startY = viewportBox.y + viewportBox.height / 2;

        // 3. Mouse Down
        await page.mouse.move(startX, startY);
        await page.mouse.down();

        // 4. Mouse Move (slightly, to trigger state change to activePaintPattern)
        // In Playwright, one move should trigger one mousemove event
        await page.mouse.move(startX + 1, startY + 1);

        // 5. Mouse Up
        // This should trigger handleMouseUp while in activePaintPattern state,
        // but before the pattern is actually created in the second handleMouseMove.
        await page.mouse.up();

        // If it didn't crash, we might need to check the console for errors
    });
});
