export type EditorAction =
    | "none"
    | "edit"
    | "dragOut"
    | "clickedPaintPattern"
    | "mousedownPaintPattern"
    | "activePaintPattern"
    | "dragPattern"
    | "dragMarker"
    | "paintBucket";

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

    constructor() {
        this.hiddenTutorials = new Set<string>();
    }

    hideTutorial(toolName: string): void {
        this.hiddenTutorials.add(toolName);
    }

    unhideTutorial(toolName: string): void {
        this.hiddenTutorials.delete(toolName);
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
