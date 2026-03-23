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
        expect(await tutorial.locator('.tutorial-title').innerText()).toBe('Path Tool');
        expect(await tutorial.locator('.tutorial-content').innerText()).toContain('Click to add points');
    });

    test('should hide tutorial when close button is clicked', async () => {
        const tutorial = page.locator('.tool-tutorial');
        await page.click('.tutorial-close');
        expect(await tutorial.isVisible()).toBe(false);
    });

    test('should not show tutorial again if "Don\'t show again" is checked', async () => {
        // Show it again by clicking a tool
        await page.click('#newCircle');
        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(true);

        // Check the checkbox
        await page.check('#dont-show-tutorial');
        
        // Hide it
        await page.click('.tutorial-close');
        
        // Try selecting another tool
        await page.click('#newEllipse');
        expect(await tutorial.isVisible()).toBe(false);
        
        // Verify localStorage
        const skip = await page.evaluate(() => localStorage.getItem('easyIcon_skipTutorials'));
        expect(skip).toBe('true');
    });

    test('should persist "Don\'t show again" after reload', async () => {
        await page.reload();
        await page.waitForSelector('#newRect');
        
        await page.click('#newRect');
        const tutorial = page.locator('.tool-tutorial');
        expect(await tutorial.isVisible()).toBe(false);
    });
});
