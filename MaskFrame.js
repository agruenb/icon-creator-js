class MaskFrame extends Frame{

    boundId;
    isMaskFrame = true;

    constructor(parentElement, infoBoxContainer, editor){
        super(parentElement, infoBoxContainer, editor);
    }
    makeMask(pattern){
        pattern.isMask = true;
        pattern.borderWidth = 1;
        pattern.color = "rgba(224, 0, 0, 0.5)";
    }
    //@Override
    append(patternObj){
        if(this.boundId != patternObj.id && !patternObj.isFiller){
            this.makeMask(patternObj);
        }
        let id = patternObj.id;
        this.patterns[id] = patternObj;
        this.renderOrder.push(String(id));
    }
    //@Override
    saveToHistory(){
        //mask frame does not keep history
    }
    //@Override
    paint(pattern){
        //mask frame always render all patterns again
        this.paintPanel.innerHTML = "";
        this.renderOrder.forEach(id => {
            if(this.patterns[id] == undefined){
                console.error("Tried to render not existing id "+id);
                return;
            }
            this.render(id);
        });
    }
    //@override
    newBox(pattern){

    }
    //@override
    updateInfoBox(pattern){

    }
    //@Override
    show(){
        this.paintPanel.style.display = "block";
    }
    //@Override
    hide(){
        this.paintPanel.innerHTML = "";
        this.paintPanel.style.display = "none";
    }
    /**
     * !!! only loads mask patterns, not loading the main pattern or the filler, they have to be there already or added manuelly
     * Loads a Frame + patterns that hast been exported with Frame.get().
     * @param {JSON} FrameJSON a JSON Object that will be loaded
     * @param {boolean} trueCopy also copies the IDs if true
     */
     load(frameJSON = {}, trueCopy = true){
        //check valid
        if(frameJSON.version != this.version){
            console.warn("Loading MaskFrame from another version");
        }
        if(frameJSON.subtype != "MaskFrame"){
            console.error("MaskFrame cannot load save of type "+frameJSON.type, frameJSON);
            return;
        }
        //load
        if(trueCopy) this.id = frameJSON.attributes.id;
        if(trueCopy) this.boundId = frameJSON.attributes.boundId;
        for(let id in frameJSON.attributes.patterns){//cannot iterate render order because of maskFiller in there
            let patternJSON = this.copy(frameJSON.attributes.patterns[id]);
            let pattern;
            switch (patternJSON.subtype) {
            case "Rect":
                pattern = new Rect();
                break;
            case "Circle":
                pattern = new Circle();
                break;
            case "Ellipse":
                pattern = new Ellipse();
                break;
            case "Line":
                pattern = new Line();
                break;
            case "Path":
                pattern = new Path();
                break;
            default:
                console.warn("Invalid subpattern: "+patternJSON.subtype);
                break;
            }
            //directly inject id
            if(trueCopy) pattern.id = patternJSON.attributes.id;
            delete patternJSON.attributes.id;
            this.append(pattern);
            pattern.load(patternJSON);
        }
    }
    /**
     * Returns the JSON representation of this frame.
     */
     get(full = false){
        //get patterns (without main pattern and filler)
        let passPatterns = {};
        for(let key in this.patterns){
            let currPat = this.patterns[key];
            if(full || (currPat.isMask && !currPat.isFiller)){
                passPatterns[key] = currPat.get(false);
            } 
        }
        let global = new IconCreatorGlobal();
        let obj = {
            id: global.id,
            version: global.version
        };
        Object.assign(obj, 
        {
            type: "Frame",
            subtype: "MaskFrame",
            attributes:{
                id:this.id,
                patterns: this.copy(passPatterns),
                boundId: this.boundId,
            }
        });
        return obj;
    }
}