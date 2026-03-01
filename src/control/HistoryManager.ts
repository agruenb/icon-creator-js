import { gAnalyticsTrackEvent } from "../lib/googleAnalytics";

/**
 * Manages undo/redo history for the editor.
 * Delegates to the current project's frame history and updates the UI buttons.
 */
export class HistoryManager {
    editor: any;

    constructor(editor: any) {
        this.editor = editor;
    }

    /**
     * Saves the current state to history if history tracking is enabled.
     */
    saveToHistory(): void {
        if (this.editor.keepHistory) {
            this.editor.currProj().frame().saveToHistory();
            this.updateHistoryButtons();
        }
    }

    /**
     * Reverses the last action (undo).
     */
    reverseLastAction(): void {
        let focusedId = (this.editor.focusedPattern() != undefined) ? this.editor.focusedPattern().id : undefined;
        this.editor.focus();
        this.editor.setDrawingType("none");
        this.editor.currProj().frame().history.reverseLast();
        //refocus pattern
        if (focusedId && this.editor.currProj().frame().patterns[focusedId] != undefined) {
            this.editor.startEdit(this.editor.currProj().frame().patterns[focusedId]);
        }
        //update ui
        this.updateHistoryButtons();
        gAnalyticsTrackEvent("reverse_action");
    }

    /**
     * Re-initializes the last reversed action (redo).
     */
    reInitLastReverse(): void {
        let focusedId = (this.editor.focusedPattern() != undefined) ? this.editor.focusedPattern().id : undefined;
        this.editor.focus();
        this.editor.setDrawingType("none");
        this.editor.currProj().frame().history.reInitLast();
        //refocus pattern
        if (focusedId && this.editor.currProj().frame().patterns[focusedId] != undefined) {
            this.editor.startEdit(this.editor.currProj().frame().patterns[focusedId]);
        }
        //update ui
        this.updateHistoryButtons();
        gAnalyticsTrackEvent("redo_action");
    }

    /**
     * Updates the enabled/disabled state of the history (undo/redo) buttons.
     */
    updateHistoryButtons(): void {
        if (this.editor.currProj().frame().isMaskFrame) {
            this.editor.environment.control.history.back.classList.add("disabled");
            this.editor.environment.control.history.forwards.classList.add("disabled");
        } else {
            if (this.editor.currProj().frame().history.currentState != this.editor.currProj().frame().history.firstPreserved) {
                this.editor.environment.control.history.back.classList.remove("disabled");
            }
            if (this.editor.currProj().frame().history.currentState != this.editor.currProj().frame().history.history.length - 1) {
                this.editor.environment.control.history.forwards.classList.remove("disabled");
            }
            if (this.editor.currProj().frame().history.currentState == this.editor.currProj().frame().history.firstPreserved) {
                this.editor.environment.control.history.back.classList.add("disabled");
            }
            if (this.editor.currProj().frame().history.currentState == this.editor.currProj().frame().history.history.length - 1) {
                this.editor.environment.control.history.forwards.classList.add("disabled");
            }
        }
    }
}
