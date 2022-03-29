class ActionHistory{

    history = new Array();

    frame;

    currentState = -1;

    //from the first (0) to firstPreserved (f.e. 3) all history events cannot be reversed
    firstPreserved = 1;

    constructor(frame = {}){
        this.frame = frame;
    }
    /**
     * Adds a new state to the history array. States can be aquired by using frame.get().
     * @param {*} state 
     */
    add(state = {}){
        if(state.type == undefined){
            console.error("Added invalid state to history");
            return;
        }
        if(state.type != "Frame"){
            console.error("History only accepts frame-states");
            return;
        }
        //remove all reversed actions
        for(let i = this.history.length; i > this.currentState+1; i--){
                this.history.pop();
        }
        this.history.push(state);
        this.currentState++;
    }
    /**
     * Reverses to the last state that has been added to this actionHistory
     */
    reverseLast(){
        //if there is history && frame is not in first state && state is outside of preserved range
        if(this.history.length > 0 && this.currentState != 0 && this.firstPreserved < this.currentState){
            let lastState = this.history[this.currentState-1];
            if(this.frame.id != lastState.attributes.id){
                console.warn("Overwriting frame "+this.frame.id+" with state from frame "+lastState.attributes.id+".");
            }
            this.frame.clear();
            this.frame.load(lastState);
            this.currentState--;
            this.frame.repaint();
        }
    }
    reInitLast(){
        if(this.currentState < this.history.length -1){
            let lastState = this.history[this.currentState+1];
            if(this.frame.id != lastState.attributes.id){
                console.warn("Overwriting frame "+this.frame.id+" with state from frame "+lastState.attributes.id+".");
            }
            this.frame.clear();
            this.frame.load(lastState);
            this.currentState++;
            this.frame.repaint();
        }
    }
    clear(){
        this.history = new Array();
        this.firstPreserved = 0;
        this.currentState = -1;
    }
}