/**
 * Manages undo/redo state history for a Frame.
 * Stores serialized frame snapshots and allows stepping back or forward through them.
 */
export default class ActionHistory {

    history: any[] = new Array();

    frame: any;

    currentState: number = -1;

    /** From the first (0) to firstPreserved, history events cannot be reversed */
    firstPreserved: number = 1;

    constructor(frame: any = {}) {
        this.frame = frame;
    }

    /**
     * Adds a new state to the history array. States can be acquired by using frame.get().
     * @param state - A serialized frame state object (must have type === "Frame")
     */
    add(state: any = {}): void {
        if (state.type == undefined) {
            console.error("Added invalid state to history");
            return;
        }
        if (state.type != "Frame") {
            console.error("History only accepts frame-states");
            return;
        }
        //remove all reversed actions
        for (let i = this.history.length; i > this.currentState + 1; i--) {
            this.history.pop();
        }
        this.history.push(state);
        this.currentState++;
    }

    /**
     * Reverses to the last state that has been added to this ActionHistory.
     */
    reverseLast(): void {
        //if there is history && frame is not in first state && state is outside of preserved range
        if (this.history.length > 0 && this.currentState != 0 && this.firstPreserved < this.currentState) {
            let lastState = this.history[this.currentState - 1];
            if (this.frame.id != lastState.attributes.id) {
                console.warn("Overwriting frame " + this.frame.id + " with state from frame " + lastState.attributes.id + ".");
            }
            this.frame.clear();
            this.frame.load(lastState);
            this.currentState--;
            this.frame.repaint();
        }
    }

    /**
     * Re-initializes the last reversed action (redo).
     */
    reInitLast(): void {
        if (this.currentState < this.history.length - 1) {
            let lastState = this.history[this.currentState + 1];
            if (this.frame.id != lastState.attributes.id) {
                console.warn("Overwriting frame " + this.frame.id + " with state from frame " + lastState.attributes.id + ".");
            }
            this.frame.clear();
            this.frame.load(lastState);
            this.currentState++;
            this.frame.repaint();
        }
    }

    /**
     * Clears all history.
     */
    clear(): void {
        this.history = new Array();
        this.firstPreserved = 0;
        this.currentState = -1;
    }
}
