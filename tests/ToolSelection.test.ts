/// <reference types="jest-playwright-preset" />

describe('Comprehensive Tool Selection Interaction Patterns', () => {
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

    const tools = [
        { id: '#newRect', selector: 'rect', name: 'Rectangle' },
        { id: '#newCircle', selector: 'circle', name: 'Circle' },
        { id: '#newEllipse', selector: 'ellipse', name: 'Ellipse' },
        { id: '#newLine', selector: 'line', name: 'Line' },
        { id: '#newPath', selector: 'path', name: 'Path' },
        { id: '#newText', selector: 'text', name: 'Text' },
    ];

    for (const tool of tools) {
        describe(`Tool: ${tool.name}`, () => {
            test(`Pattern 1: Drag from sidebar`, async () => {
                await page.waitForSelector(tool.id);
                const toolElement = await page.$(tool.id);
                const toolBox = await toolElement?.boundingBox();

                await page.waitForSelector('#viewport');
                const viewport = await page.$('#viewport');
                const viewportBox = await viewport?.boundingBox();

                if (!toolBox || !viewportBox) throw new Error(`${tool.name} elements not found`);

                await page.mouse.move(toolBox.x + toolBox.width / 2, toolBox.y + toolBox.height / 2);
                await page.mouse.down();
                const targetX = viewportBox.x + viewportBox.width / 2;
                const targetY = viewportBox.y + viewportBox.height / 2;
                await page.mouse.move(targetX, targetY, { steps: 10 });
                await page.mouse.up();

                const count = await page.$$eval(`#drawingViewport ${tool.selector}`, (els, sel) => els.length, tool.selector);
                expect(count).toBeGreaterThan(0);
            });

            test(`Pattern 2: Click and Place`, async () => {
                await page.click(tool.id);
                const viewport = await page.$('#viewport');
                const viewportBox = await viewport?.boundingBox();
                if (!viewportBox) throw new Error('Viewport not found');

                const targetX = viewportBox.x + viewportBox.width / 2;
                const targetY = viewportBox.y + viewportBox.height / 2;
                await page.mouse.click(targetX, targetY);

                // Special case for Path: it needs to be finished
                if (tool.selector === 'path') {
                    // One click adds a point, another click on the start point finishes it
                    // The start point is at targetX, targetY
                    await page.mouse.click(targetX, targetY);
                }

                const count = await page.$$eval(`#drawingViewport ${tool.selector}`, (els, sel) => els.length, tool.selector);
                expect(count).toBeGreaterThan(0);
            });

            test(`Pattern 3: Click and Drag`, async () => {
                await page.click(tool.id);
                const viewport = await page.$('#viewport');
                const viewportBox = await viewport?.boundingBox();
                if (!viewportBox) throw new Error('Viewport not found');

                const startX = viewportBox.x + viewportBox.width / 4;
                const startY = viewportBox.y + viewportBox.height / 4;
                const endX = viewportBox.x + viewportBox.width / 2;
                const endY = viewportBox.y + viewportBox.height / 2;

                await page.mouse.move(startX, startY);
                await page.mouse.down();
                await page.mouse.move(endX, endY, { steps: 10 });
                await page.mouse.up();

                // Special case for Path: it needs a more complex interaction to be finished
                if (tool.selector === 'path') {
                    // Current state: Mouse is up at endX, endY. The first line is drawn.
                    // Now add another point at a different location
                    const midX = viewportBox.x + viewportBox.width / 2;
                    const midY = viewportBox.y + (viewportBox.height / 4) * 3;
                    await page.mouse.click(midX, midY);

                    // Click back on the start point to finish the path
                    await page.mouse.click(startX, startY);
                }

                const count = await page.$$eval(`#drawingViewport ${tool.selector}`, (els, sel) => els.length, tool.selector);
                expect(count).toBeGreaterThan(0);
            });
        });
    }
});
