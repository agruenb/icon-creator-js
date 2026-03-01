import PatternManipulator from "../shared/patternManipulator";

/**
 * Manages pattern-level operations: duplication, removal, mirroring, and creation.
 * Encapsulates pattern manipulation logic extracted from HTMLeditor.
 */
export class PatternManager {
    editor: any;

    constructor(editor: any) {
        this.editor = editor;
    }

    /**
     * Creates a new pattern of the given type at position (x, y).
     * @param type - Pattern class identifier string
     * @param x - Absolute X coordinate of the click event
     * @param y - Absolute Y coordinate of the click event
     * @returns The newly created pattern
     */
    addPattern(type: string, x: number, y: number): any {
        let pattern = this.editor.currProj().newPattern(type, this.editor.relX(x), this.editor.relY(y));
        return pattern;
    }

    /**
     * Duplicates the given pattern and focuses the copy.
     * @param pattern - The pattern to duplicate
     */
    duplicate(pattern: any): void {
        let dup = PatternManipulator.createWithSameClass(pattern);
        this.editor.currProj().frame().append(dup);
        dup.load(pattern.get(), false);
        dup.translateTo(dup.xOrigin + 20, dup.yOrigin + 20);
        this.editor.currProj().frame().newBox(dup);
        this.editor.stopEdit();
        this.editor.startEdit(dup);
    }

    /**
     * Duplicates the currently focused pattern, if any.
     */
    duplicateCurrentPattern(): void {
        if (this.editor.focusedPattern() != undefined) {
            this.duplicate(this.editor.focusedPattern());
            this.editor.saveToHistory();
        }
    }

    /**
     * Removes the currently focused pattern, if any.
     */
    removeCurrentPattern(): void {
        if (this.editor.focusedPattern() != undefined) {
            this.removePattern(this.editor.focusedPattern());
            this.editor.saveToHistory();
        }
    }

    /**
     * Removes a pattern from the current project. Does NOT save to history.
     * @param pattern - The pattern to remove
     */
    removePattern(pattern: any): void {
        this.editor.stopEdit();
        this.editor.currProj().remove(pattern);
    }

    /**
     * Mirrors the currently focused pattern vertically, if any.
     */
    mirrorCurrentPatternVertical(): void {
        if (this.editor.focusedPattern() != undefined) {
            this.editor.focusedPattern().mirrorVertically();
            this.editor.currProj().repaint(this.editor.focusedPattern());
            this.editor.saveToHistory();
            this.editor.clearViewportUI();
            this.editor.addEditUI();
        }
    }

    /**
     * Mirrors the currently focused pattern horizontally, if any.
     */
    mirrorCurrentPatternHorizontal(): void {
        if (this.editor.focusedPattern() != undefined) {
            this.editor.focusedPattern().mirrorHorizontally();
            this.editor.currProj().repaint(this.editor.focusedPattern());
            this.editor.saveToHistory();
            this.editor.clearViewportUI();
            this.editor.addEditUI();
        }
    }
}
