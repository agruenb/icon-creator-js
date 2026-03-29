export type EditorAction =
    | "none"
    | "edit"
    | "dragOut"
    | "clickedPaintPattern"
    | "mousedownPaintPattern"
    | "activePaintPattern"
    | "dragPattern"
    | "dragMarker";

export type EditorView = "arange" | "mask";

export interface MouseInfo {
    x: number;
    y: number;
}

export interface DraggingInfo {
    x: number;
    y: number;
    relToPatternOriginX: number;
    relToPatternOriginY: number;
}

export class EditorState {
    currentAction: EditorAction = "none";
    editedObject: any = undefined; // Type as 'any' for now, will refine later
    mouseDownInfo: MouseInfo | undefined = undefined;
    view: EditorView = "arange";
    currentProject: number = 0;
    gridsize: number = 1;
    draggingInfo: DraggingInfo | undefined = undefined;
    paintPatternClass: any = undefined; // Type as 'any' for now
    hiddenTutorials: Set<string>;

    private static readonly HIDDEN_TUTORIALS_KEY = "easyIcon_hiddenTutorials";

    constructor() {
        // Restore hidden tutorials from localStorage
        this.hiddenTutorials = new Set<string>();
        try {
            const stored = localStorage.getItem(EditorState.HIDDEN_TUTORIALS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    parsed.forEach((t: string) => this.hiddenTutorials.add(t));
                }
            }
        } catch {
            // Ignore parse errors
        }
    }

    private persistHiddenTutorials(): void {
        localStorage.setItem(
            EditorState.HIDDEN_TUTORIALS_KEY,
            JSON.stringify([...this.hiddenTutorials])
        );
    }

    hideTutorial(toolName: string): void {
        this.hiddenTutorials.add(toolName);
        this.persistHiddenTutorials();
    }

    unhideTutorial(toolName: string): void {
        this.hiddenTutorials.delete(toolName);
        this.persistHiddenTutorials();
    }

    isTutorialHidden(toolName: string): boolean {
        return this.hiddenTutorials.has(toolName);
    }

    // Helper methods to ensure type safety when updating state
    setAction(action: EditorAction) {
        this.currentAction = action;
    }

    setDraggingInfo(info: DraggingInfo) {
        this.draggingInfo = info;
    }

    reset(): void {
        this.currentAction = "none";
        this.editedObject = undefined;
        this.mouseDownInfo = undefined;
        this.draggingInfo = undefined;
    }
}
