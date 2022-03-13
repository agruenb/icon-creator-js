class Project extends IconCreatorGlobal{

    editor;

    infoBoxContainer;
    container;
    frameContainer;
    contextContainer;
    viewportOutline;

    initialized = false;
    generateColors = true;
    colorMachine = new ColorMachine("pastel");
    paintColor = "default";
    bgType = "lines";
    bgGridsize = 1;

    keyframes = new Array();

    currentFrame;

    constructor(infoBoxContainer, editor){
        super();
        this.editor = editor;
        this.infoBoxContainer = infoBoxContainer;
        this.dimensions = {
            width:"512",
            height:"512"
        }
    }
    init(fullViewport){
        this.initialized = true;
        this.container = document.createElement("div");
        //this.container.style.cssText = "top:10px";

        this.frameContainer = document.createElement("div");
        this.frameContainer.style.cssText = "height:"+this.dimensions.height+"px;width:"+this.dimensions.width+"px;";

        this.viewportOutline = document.createElement("div");
        let outlineWidth = parseInt(this.dimensions.width) - 4;
        let outlineHeight = parseInt(this.dimensions.height) - 4;
        this.viewportOutline.style.cssText = "pointer-events:none;height:"+outlineWidth+"px;width:"+outlineHeight+"px;position:absolute;top:calc((100vh - 512px) / 2);left:calc((100vw - 512px) / 2);border-radius:2px;z-index:10000;";
        
        this.contextContainer = this.frameContainer.cloneNode(false);
        this.contextContainer.style.cssText = "position:absolute;top:calc((100vh - 512px) / 2);left:calc((100vw - 512px) / 2);";
        this.contextContainer.style.opacity = "0.4";
        this.contextContainer.style.pointerEvents = "none";

        let firstFrame = new Frame(this.frameContainer,this.infoBoxContainer, this.editor);
        firstFrame.paintPanel.style.display = "block";
        this.keyframes.push(firstFrame);
        this.currentFrame = this.keyframes[0];

        this.bgCanvas = document.createElement("canvas");
        this.bgCanvas.style.cssText = "position:absolute;top:0;left:0;height:100vh;width:100vw;";
        
        this.container.append(this.frameContainer);
        this.container.append(this.bgCanvas);
        this.container.append(this.viewportOutline);
        this.container.append(this.contextContainer);
        //configure canvas after viewport size
        this.fullViewport = fullViewport;
        this.drawBg();
        
        //setup css inside head
        var css = 'svg[role=main] *{pointer-events:all;}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        //paintColor
        this.editor.environment.control.meta.paintColor.querySelector("input").value = this.colorMachine.pallet()[0];
        this.editor.environment.control.meta.paintColor.querySelector("input").dispatchEvent(new Event('change'));
        this.colorMachine.next();
    }
    frame(){
        return this.currentFrame;
    }
    /**
     * Changes the visible frame and paints the ui.
     * @param {Frame} frame 
     */
    setFrame(frame){
        this.currentFrame.paintPanel.innerHTML = "";
        this.currentFrame.paintPanel.style.display = "none";
        this.currentFrame.hide();
        this.currentFrame = frame;
        this.currentFrame.paintPanel.style.display = "block";
        this.currentFrame.show();
        this.repaint();
    }
    /**
     * Sets a frame as drawing context. This means the frame will be displayed as background with low opacity.
     * @param {Frame} frame that should be seen as context. If frame is undefined the context is removed.
     */
    setContext(frame){
        return
        if(frame){
            this.contextContainer.innerHTML = "";
            let contextFrame = new Frame(this.contextContainer, this.infoBoxContainer, this.editor);
            contextFrame.load(frame.get(), false, false);
            contextFrame.paintPanel.style.display = "block";
            contextFrame.repaint();
        }else{
            this.contextContainer.innerHTML = "";
        }
    }
    drawBg(){
        let lightLinesLightBg = "#eaeaea";
        let strongLinesLightBg = "#cecece";
        let viewportDomBox = this.fullViewport.getBoundingClientRect();
        this.bgCanvas.setAttribute("width",viewportDomBox.width+"px");
        this.bgCanvas.setAttribute("height",viewportDomBox.height+"px");
        let highlightInterval = 4;
        let schemeColor =  (this.editor.colorSchemeLight)?"#1a1a1a":"#dbdbdb"
        //border
        this.viewportOutline.style.border = `2px solid ${schemeColor}`;
        //inner drawing
        let pen = this.bgCanvas.getContext("2d");
        //pen.fillStyle = "white";
        pen.clearRect(0,0,viewportDomBox.width,viewportDomBox.height);
        if(this.bgGridsize > 8){//only render if grid not too fine
            //offset to align with drawingViewport
            let offsetX = parseInt(((viewportDomBox.width - parseInt(this.dimensions.width)) / 2)%(this.bgGridsize*highlightInterval));
            let offsetY = parseInt(((viewportDomBox.height - parseInt(this.dimensions.height)) / 2)%(this.bgGridsize*highlightInterval));
            //move back lines to start at viewport start even with offset
            let iterationOffsetX = Math.round(offsetX / this.bgGridsize);
            let iterationOffsetY = Math.round(offsetY / this.bgGridsize);
            switch (this.bgType) {
                case "dotts":
                    let dottAmountX = parseInt(parseInt(this.dimensions.width)/this.bgGridsize);
                    let dottAmountY = parseInt(parseInt(this.dimensions.height)/this.bgGridsize);
                    pen.fillStyle = pen.strokeStyle = schemeColor;
                    for(let x = 1; x < dottAmountX; x++){
                        for (let y = 1; y < dottAmountY; y++) {
                            //every 5th point red cross
                            if(x%highlightInterval === 0 && y%highlightInterval === 0){
                                pen.beginPath();
                                pen.arc(x*this.bgGridsize - 0.5, y*this.bgGridsize - 0.5, 2, 0, Math.PI * 2);
                                pen.fill();
                            }else{
                                pen.fillRect(x*this.bgGridsize - 0.5, y*this.bgGridsize - 0.5, 1, 1);
                            }                            
                        }
                    }
                    break;
                case "lines":
                    let lineAmountX = parseInt(parseInt(viewportDomBox.width)/this.bgGridsize);
                    let lineAmountY = parseInt(parseInt(viewportDomBox.height)/this.bgGridsize);
                    pen.lineWidth = 1.5;
                    for(let x = 1 - iterationOffsetX; x < lineAmountX; x++){
                        pen.beginPath();
                        if(x%highlightInterval == 0){
                            pen.strokeStyle = strongLinesLightBg;
                        }else{
                            pen.strokeStyle = lightLinesLightBg;
                        }
                        pen.moveTo((this.bgGridsize*x) + 0.75 + offsetX, 0);
                        pen.lineTo((this.bgGridsize*x) + 0.75 + offsetX, viewportDomBox.height);
                        pen.stroke();
                        pen.closePath();
                    }
                    for (let y = 1 - iterationOffsetY; y < lineAmountY; y++) {
                        pen.beginPath();
                        if(y%highlightInterval == 0){
                            pen.strokeStyle = strongLinesLightBg;
                        }else{
                            pen.strokeStyle = lightLinesLightBg;
                        }
                        pen.moveTo(0, (y*this.bgGridsize) + 0.5 + offsetY);
                        pen.lineTo(viewportDomBox.width, (y*this.bgGridsize) + 0.5 + offsetY);   
                        pen.stroke();   
                        pen.closePath();                    
                    }
                    break;
                default:
                    console.warn(this.bgType);
                    break;
            }
        }
    }
    newPattern(type,xOrigin,yOrigin){
        return this.frame().newPattern(type, xOrigin, yOrigin, this.getColor());
    }
    getColor(){
        let color;
        if(this.paintColor == "default" && this.generateColors){
            color = this.editor.environment.control.meta.paintColor.querySelector("input").value;
            let newColor = this.colorMachine.next();
            this.editor.environment.control.meta.paintColor.querySelector("input").value = newColor;
            this.editor.environment.control.meta.paintColor.querySelector("input").dispatchEvent(new Event('change'));
        }else{
            color = this.paintColor;
        }
        return color;
    }
    setColor(color = "#000000"){
        this.paintColor = color;
        if(this.editor.environment.control.meta.paintColor.querySelector("input").value != color){
            this.editor.environment.control.meta.paintColor.querySelector("input").value = color;
            this.editor.environment.control.meta.paintColor.querySelector("input").dispatchEvent(new Event('change'));
        }
    }
    /**
     * Calls the alterPattern function of the active Frame. Passed attributes in attrObject are adjusted in pattern. Use this function to alter Patterns, because is also adjusts the mask.
     * @param {Pattern} pattern pattern that should be altered
     * @param {Object} attrObject object containing the changes
     * @param {Boolean} repaint default true; repaint the frame after altering
     */
    alterPattern(pattern,attrObject,repaint = true){
        this.frame().alterPattern(pattern,attrObject,repaint);
    }
    repaint(pattern){
        this.frame().paint(pattern);
    }
    toTop(pattern){
        this.frame().toTop(pattern);
    }
    toBottom(pattern){
        this.frame().toBottom(pattern);
    }
    oneUp(pattern){
        this.frame().oneUp(pattern);
    }
    oneDown(pattern){
        this.frame().oneDown(pattern);
    }
    /**
     * Loads a project and its frames + patterns that hast been exported with project.get(). Note that the current project will be overwritten.
     * @param {JSON} projectJSON a JSON Object that will be loaded
     */
    load(projectJSON = {}){
        //check valid
        if(projectJSON.version != this.version){
            console.warn("Loading project from another version");
        }
        if(projectJSON.type != "project"){
            console.error("Project cannot load save of type "+projectJSON.type);
            return;
        }
        //clear
        for(let index in this.keyframes){
            this.keyframes[index].delete();
        }
        this.keyframes = [];
        //load
        for(let index in projectJSON.attributes.keyframes){
            let frame = new Frame(this.frameContainer, this.infoBoxContainer, this.editor);
            frame.load(projectJSON.attributes.keyframes[index]);
            this.keyframes.push(frame);
        }
        this.setFrame(this.keyframes[0]);
    }
    /**
     * Returns the JSON representation of this project.
     */
    get(){
        let passKeyframes = [];
        for(let index in this.keyframes){
            passKeyframes.push(this.keyframes[index].get());
        }
        let obj = super.get();
        Object.assign(obj, 
        {
            type: "project",
            attributes:{
                initialized: this.initialized,
                id:this.id,

                keyframes: passKeyframes
            }
        });
        return this.copy(obj);
    }
}