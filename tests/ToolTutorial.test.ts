/// <reference types="jest-playwright-preset" />

describe('Tool Tutorial', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000');
        await page.setViewportSize({ width: 1280, height: 800 });
        // Clear localStorage to ensure a clean state
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should show tutorial when a tool is selected', async () => {
        await page.waitForSelector('#newRect');

        // Select Rectangle tool
        await page.click('#newRect');

        // Check if tutorial is visible
        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(true);
        expect(await tutorial.locator('.tutorial-title').innerText()).toBe('Rectangle Tool');
        expect(await tutorial.locator('.tutorial-content').innerText()).toBe('Click and drag on the canvas to draw a rectangle.');
    });

    test('should update tutorial when switching tools', async () => {
        // Select Path tool
        await page.click('#newPath');

        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(true);
        expect(await tutorial.locator('.tutorial-title').innerText()).toBe('Custom Shape Tool');
        expect(await tutorial.locator('.tutorial-content').innerText()).toContain('Click to add points');
    });

    test('should hide tutorial when close button is clicked', async () => {
        const tutorial = page.locator('.tool-tutorial');
        await page.click('.tutorial-close');
        expect(await tutorial.isVisible()).toBe(false);
    });

    test('should hide tutorial per-tool when "Don\'t show again" is checked', async () => {
        const tutorial = page.locator('.tool-tutorial');

        // Show tutorial for Circle
        await page.click('#newCircle');
        expect(await tutorial.isVisible()).toBe(true);
        expect(await tutorial.locator('.tutorial-title').innerText()).toBe('Circle Tool');

        // Check the "don't show again" checkbox for Circle
        await page.check('#dont-show-tutorial');

        // Hide it
        await page.click('.tutorial-close');

        // Clicking Circle again should NOT show the tutorial
        await page.click('#newCircle');
        expect(await tutorial.isVisible()).toBe(false);

        // But clicking a different tool (Ellipse) SHOULD still show tutorial
        await page.click('#newEllipse');
        expect(await tutorial.isVisible()).toBe(true);
        expect(await tutorial.locator('.tutorial-title').innerText()).toBe('Ellipse Tool');
    });

    test('should persist per-tool hidden state after reload', async () => {
        // Circle was hidden in the previous test
        await page.reload();
        await page.waitForSelector('#newRect');

        // Circle tutorial should still be hidden (localStorage persists)
        await page.click('#newCircle');
        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(false);

        // Rect tutorial should still show (was never hidden)
        await page.click('#newRect');
        expect(await tutorial.isVisible()).toBe(true);
    });

    test('should position tutorial at same height as selected tool', async () => {
        await page.click('#newRect');

        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(true);

        const rectButton = page.locator('#newRect');
        const buttonBox = await rectButton.boundingBox();
        const tutorialBox = await tutorial.boundingBox();

        // Tutorial top should be approximately at the same vertical position as the button
        expect(Math.abs(tutorialBox!.y - buttonBox!.y)).toBeLessThan(5);
    });
});
