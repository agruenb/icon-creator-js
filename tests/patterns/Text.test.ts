/**
 * @jest-environment node
 */
import Text from '../../src/patterns/Text';
import Rect from '../../src/patterns/Rect';

describe('Text Pattern', () => {
    let textPattern: Text;

    beforeEach(() => {
        textPattern = new Text(0, 0, 250, 50, "Test", "#000000");
    });

    describe('Text Editing via Keypress', () => {
        beforeEach(() => {
            textPattern.doubleclicked(); // sets isEditing = true
        });

        it('should add printable characters to content', () => {
            const initialLength = textPattern.content.length;
            textPattern.keypress({ key: 's', ctrlKey: false, metaKey: false } as KeyboardEvent);
            expect(textPattern.content).toBe('Tests');
            expect(textPattern.cursorPosition).toBe(initialLength + 1);
        });

        it('should handle backspace correctly', () => {
            textPattern.keypress({ code: 'Backspace', key: 'Backspace' } as KeyboardEvent);
            expect(textPattern.content).toBe('Tes');
            expect(textPattern.cursorPosition).toBe(3);
        });

        it('should ignore printable characters if not editing', () => {
            textPattern.lostFocus(); // sets isEditing = false
            const result = textPattern.keypress({ key: 's', ctrlKey: false, metaKey: false } as KeyboardEvent);
            expect(result).toBe(false);
            expect(textPattern.content).toBe('Test');
        });

        it('should move cursor left and right', () => {
            textPattern.keypress({ code: 'ArrowLeft', key: 'ArrowLeft' } as KeyboardEvent);
            expect(textPattern.cursorPosition).toBe(3);

            textPattern.keypress({ key: 'x', ctrlKey: false, metaKey: false } as KeyboardEvent);
            expect(textPattern.content).toBe('Tesxt');
            expect(textPattern.cursorPosition).toBe(4);

            textPattern.keypress({ code: 'ArrowRight', key: 'ArrowRight' } as KeyboardEvent);
            expect(textPattern.cursorPosition).toBe(5);
        });

        it('should handle delete correctly', () => {
            textPattern.keypress({ code: 'ArrowLeft', key: 'ArrowLeft' } as KeyboardEvent);
            textPattern.keypress({ code: 'ArrowLeft', key: 'ArrowLeft' } as KeyboardEvent);
            // cursor is at position 2 (after 'e')
            textPattern.keypress({ code: 'Delete', key: 'Delete' } as KeyboardEvent);
            expect(textPattern.content).toBe('Tet');
            expect(textPattern.cursorPosition).toBe(2);
        });
    });

    describe('Markers & Geometry', () => {
        it('should compute getOutline correctly', () => {
            const outline = textPattern.getOutline();
            expect(outline.width).toBe(250);
            expect(outline.height).toBe(50);
        });

        it('should rotate around center correctly when marker is edited', () => {
            // center of Text initialized at (0,0) width 250, height 50 is (125, -25)
            // If we drag the rotation marker to the right of the center by 100 on X, Y=0 (relative to center) -> 90 degrees
            const changes = textPattern.markerEdited({ memorize: 'rotate', x: textPattern.center[0] + 100, y: textPattern.center[1] }, null, textPattern.center[0] + 100, textPattern.center[1]);
            expect(changes.rotation).toBeDefined();
            // angle will be 90 according to PointOperations logic for straight right
            expect(changes.rotation).toBe(90);

            // drag straight down -> 180 degrees
            const changesDown = textPattern.markerEdited({ memorize: 'rotate', x: textPattern.center[0], y: textPattern.center[1] + 100 }, null, textPattern.center[0], textPattern.center[1] + 100);
            expect(changesDown.rotation).toBe(180);
        });

        it('should resize correctly from markers', () => {
            const changes = textPattern.markerEdited({ memorize: 'right', x: 500, y: 0 }, null, 500, 0);
            expect(changes.width).toBeGreaterThan(250);
        });
    });

    describe('HTML Output', () => {
        it('cleanHTML should return an SVG text element', () => {
            const html = textPattern.cleanHTML();
            expect(html).toContain('<text');
            expect(html).toContain('>Test</text>');
            expect(html).toContain('font-family:Arial, sans-serif;');
        });

        it('cleanHTML should include cursor when editing', () => {
            textPattern.doubleclicked(); // editing mode
            const html = textPattern.cleanHTML();
            expect(html).toContain('<text');
            expect(html).toContain('|<'); // The text with cursor
        });
    });
});
