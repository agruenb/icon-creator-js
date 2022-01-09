class Frame extends IconCreatorGlobal{

    history = new ActionHistory(this);
    
    paintPanel = document.createElement("div");
    uiLayer = document.createElement("div");

    patterns = {};
    renderOrder = new Array();

    markers = new Array();
    focusedPattern;

    width = 512;
    height = 512;

    constructor(parentElement, infoBoxContainer, editor){
        super();
        this.infoBoxContainer = infoBoxContainer;
        this.parentElement = parentElement;
        this.editor = editor;

        this.paintPanel.style.cssText = "width:"+parentElement.style.width+";height:"+parentElement.style.height+";";
        this.paintPanel.style.display = "none";
        this.paintPanel.setAttribute("frameId",this.id);
        parentElement.append(this.paintPanel);
        this.uiLayer.setAttribute("el-type","uiLayer");
        //z-index is also rel to elements so if there are more than 9999 elements, thw ui is behind them
        this.uiLayer.style.cssText = "position:absolute;overflow:hidden;z-index:9999;pointer-events:none;height:100%;width:100%;top:0;left:0;";

        parentElement.append(this.uiLayer);
        if(infoBoxContainer != undefined){
            this.infoBoxManager = new InfoBoxManager(infoBoxContainer, this);
        }else{
            this.infoBoxManager = new InfoBoxManager(undefined,true);
        }
        this.history.add(this.get());
    }
    append(patternObj){
        let id = patternObj.id;
        this.patterns[id] = patternObj;
        this.renderOrder.push(String(id));
    }
    remove(pattern, repaint = true){
        delete this.patterns[pattern];
        this.renderOrder.splice(this.renderOrder.indexOf(pattern.id),1);
        this.infoBoxManager.remove(pattern);
        if(repaint){
            this.repaint();
        }
    }
    newPattern(type,xOrigin,yOrigin,color = "#ffee00"){
        //this object is the main pattern object for dragging ect.
        let pattern = this.basicPattern(type,xOrigin,yOrigin,color);
        pattern.addMaskFrame(this.parentElement, this.infoBoxContainer, this.editor);
        this.append(pattern);
        this.repaint();
        return pattern;
    }
    newBox(pattern){
        this.infoBoxManager.newBox(pattern);
    }
    updateInfoBox(pattern){
        this.infoBoxManager.updateBox(pattern);
    }
    hide(){
        this.infoBoxManager.hide();
    }
    show(){
        this.infoBoxManager.show();
    }
    basicPattern(type,xOrigin,yOrigin,color){
        let pattern;
        switch (type) {
            case "Rect":
                pattern = new Rect(xOrigin,yOrigin,2,2,color);
                break;
            case "Circle":
                pattern = new Circle(xOrigin,yOrigin,2,color);
                break;
            case "Ellipse":
                pattern = new Ellipse(xOrigin,yOrigin,2,2,color);
                break;
            case "Line":
                pattern = new Line(xOrigin,yOrigin,xOrigin,yOrigin,color);
                break;
            case "Path":
                pattern = new Path(xOrigin,yOrigin,new Array(),color);
                break;
            default:
                break;
        }
        return pattern;
    }
    patternById(id){
        return this.patterns[id];
    }
    ids(){
        return Object.keys(this.patterns);
    }
    clearUI(){
        this.markers = new Array();
        this.uiLayer.innerHTML = "";
    }
    focus(pattern){
        if(pattern != undefined){
            this.focusedPattern = pattern;
        }else{
            this.focusedPattern = undefined;
        }
    }
    stopEdit(){
        this.focus(undefined);
        this.infoBoxManager.muteAll();
        this.clearUI();
    }
    /**
     * Adjusts attributes to make a pattern a mask filler. The mask filler is a fully white copy of the main pattern to make its shape appear.
     * @param {Pattern} pattern pattern that should be converted
     */
    makeMaskFiller(pattern){
        pattern.display = false;
        pattern.isMask = true;
        pattern.isFiller = true;
        pattern.borderColor = "#ffffff";
        pattern.color = "#ffffff";
    };
    toTop(pattern = {}){
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if(indexOfId != this.renderOrder.length -1){
            this.renderOrder.splice(indexOfId,1);
            this.renderOrder.push(pattern.id);
            this.repaint();
        }
    }
    toBottom(pattern = {}){
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if(indexOfId != 0){
            this.renderOrder.splice(indexOfId,1);
            this.renderOrder.unshift(pattern.id);
            this.repaint();
        }
    }
    oneUp(pattern = {}){
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if(indexOfId !== this.renderOrder.length - 1){
            [this.renderOrder[indexOfId], this.renderOrder[indexOfId+1]] = [this.renderOrder[indexOfId + 1], this.renderOrder[indexOfId]];
            this.repaint();
        }
    }
    oneDown(pattern = {}){
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if(indexOfId !== 0){
            [this.renderOrder[indexOfId], this.renderOrder[indexOfId-1]] = [this.renderOrder[indexOfId - 1], this.renderOrder[indexOfId]];
            this.repaint();
        }
    }
    alterPattern(pattern,attrObject,repaint = false){
        Object.assign(pattern,attrObject);
        //change mask filler
        if(!pattern.isMask){
            let copy = JSON.parse(JSON.stringify(attrObject));
            this.makeMaskFiller(copy);
            Object.assign(pattern.maskLayer.patterns[pattern.id+"filler"],copy);
            //console.log(pattern.maskLayer.patterns[pattern.id+"filler"]);
        }
        pattern.updateProperties();
        if(repaint){
            this.paint(pattern);
        }
    }
    saveToHistory(){
        this.history.add(this.get());
    }
    repaint(){
        this.paint();
    }
    paint(pattern){
        if(pattern === undefined){//render all
            this.paintPanel.innerHTML = "";
            this.renderOrder.forEach(id => {
                if(this.patterns[id] == undefined){
                    console.error("Tried to render not existing id "+id);
                    return;
                }
                if(!this.patterns[id].isMask){
                    this.render(id);
                }
            });
        }else{
            if(document.getElementById(pattern.id) !== null){
                document.getElementById(pattern.id).remove();
            }
            this.render(pattern.id);
        }
    }
    render(id = ""){
        //get positioning
        let paintPortRect = this.parentElement.getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();
        //render patterns
        let pattern = this.patterns[id];
        if(pattern.display){
            let rotation = pattern.rotation;
            if(this.boundId == pattern.id){//dont rotate on ausschneide ansicht
                pattern.rotation = 0;
            }
            let domString = "<svg role='main' id='"+id+"' viewBox='-"+parseInt(paintPortRect.x)+" -"+parseInt(paintPortRect.y)+" "+parseInt(bodyRect.width) + " " + parseInt(bodyRect.height) + "' style='z-index:"+(this.renderOrder.indexOf(id)+3)+";pointer-events:none;position:absolute;top:0;left:0;height:100%;width:100%;'>"+pattern.fullHTML(true)+"</svg>";
            pattern.rotation = rotation;
            let template = document.createElement('template');
            domString = domString.trim();
            template.innerHTML = domString;
            this.paintPanel.append(template.content.firstChild);
        }
    }
    /**
     * Removes patterns from this Frame. Does not remove Frame.
     */
    clear(){
        for(let id in this.patterns){
            this.remove(this.patterns[id]);
        }
    }
    /**
     * Loads a Frame + patterns that hast been exported with Frame.get().
     * @param {JSON} FrameJSON a JSON Object that will be loaded
     * @param {boolean} trueCopy also copies the IDs if true
     * @param {boolean} loadInfoBox should pattern InfoBoxes be created
     */
    load(frameJSON = {}, trueCopy = true, loadInfoBox = true){
        //check valid
        if(frameJSON.version != this.version){
            console.warn("Loading frame from another version");
        }
        if(frameJSON.type != "Frame"){
            console.error("frame cannot load save of type "+frameJSON.type);
            return;
        }
        //load
        this.id = frameJSON.attributes.id;
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
            pattern.addMaskFrame(this.parentElement, this.infoBoxContainer, this.editor);
            pattern.load(patternJSON);
            if(loadInfoBox){
                this.infoBoxManager.newBox(pattern);
            }
        }
        //add render Order
        if(trueCopy) this.renderOrder = this.copy(frameJSON.attributes.renderOrder);
    }
    /**
     * Returns the JSON representation of this frame.
     */
     get(){
        //get patterns (without main pattern and filler if is maskLayer)
        let passPatterns = {};
        for(let key in this.patterns){
            let currPat = this.patterns[key];
            passPatterns[key] = currPat.get();
        }
        let obj = super.get();
        Object.assign(obj, 
        {
            type: "Frame",
            attributes:{
                id:this.id,
                width: this.width,
                height: this.height,
                patterns: this.copy(passPatterns),
                renderOrder: this.copy(this.renderOrder),
            }
        });
        return obj;
    }
    /**
     * Removes all ui elements from dom
     */
    delete(){
        this.clear();
        this.paintPanel.remove();
        this.uiLayer.remove();
    }
}