class Pattern extends IconCreatorGlobal{
    
    display = true;

    isUI = false;
    isMask = false;
    isFiller = false;//the filler is always identical to the main pattern
    maskLayer;
    boundId;

    rotationSnap = [0, 45, 90, 135, 180, 225, 270, 315];
    snapTolerance = 3;
    defaultTranslation = [-50,-50];

    constructor(xOrigin = 0,yOrigin = 0){
        super();
        this.xOrigin = xOrigin;
        this.yOrigin = yOrigin; 
    }
    translateMaskTo(newMainOriginX, newMainOriginY){
        if(!this.isMask){
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.isMask){//only translate mask, because pattern itself is also in the MaskFrame
                    let xDiff = maskItem.xOrigin - this.xOrigin;
                    let yDiff = maskItem.yOrigin - this.yOrigin;
                    maskItem.translateTo(newMainOriginX + xDiff,newMainOriginY + yDiff);
                }
            }
        }
    }
    initialDefaultTranslation(){
        this.translateTo(this.xOrigin + this.defaultTranslation[0], this.yOrigin + this.defaultTranslation[1]);
    }
    /**
     * Add a maskLayer to this pattern
     * @param {*} pattern 
     */
    addMaskFrame(parentElement, infoBoxContainer, editor){
        //create mask layer
        this.maskLayer = new MaskFrame(parentElement, infoBoxContainer, editor);
        this.maskLayer.boundId = this.id;
        this.maskLayer.history.firstPreserved = 1;//if set to 0 the frame is somehow reset
        //add to mask view
        this.maskLayer.append(this);
        //newPatternMaskFill object is the background filler for the mask property
        let newPatternMaskFill = PatternManipulator.duplicate(this);
        newPatternMaskFill.id = this.id+"filler";
        newPatternMaskFill.display = false;
        newPatternMaskFill.isMask = true;
        newPatternMaskFill.isFiller = true;
        this.maskLayer.append(newPatternMaskFill);
    }
    hasMask(){
        //console.log(this.maskLayer); TODO unparsed maskLayer in maskLayer attribute
        if(this.maskLayer != undefined && this.maskLayer.renderOrder != undefined && this.maskLayer.renderOrder.length > 2){
            return true;
        }else{
            return false;
        }
    }
    maskLink(){
        return (!this.isMask)?('mask="url(#'+ this.id +'mask)"'):"";
    }
    /**
     * NOT USED
     * @returns svg-html string with repeating pattern
     */
    maskTexture(){
        return `<defs><pattern id="maskTexture" viewBox="0,0,512,512" width="5%" height="5%"><line x1="64" y1="64" x2="192" y2="192" stroke="#db0000" stroke-width="100" stroke-linecap="round"/><line x1="320" y1="448" x2="448" y2="320" stroke="#db0000" stroke-width="100" stroke-linecap="round"/></pattern></defs>`;
    }
    /**
     * 
     * @param {Number} xPos the x position of the yAxis that should be mirrored around
     */
    mirrorVertically(xPos){
        if(!this.isMask){
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.isMask){
                    maskItem.mirrorVertically(xPos);
                }
            }
        }
    }
    /**
     * 
     * @param {Number} yPos the y position of the yAxis that should be mirrored around
     */
    mirrorHorizontally(yPos){
        if(!this.isMask){
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.isMask){
                    maskItem.mirrorHorizontally(yPos);
                }
            }
        }
    }
    mask(limitPrecision){//return patterns in mask layer as html
        if(!this.isMask && this.allowMask){
            let maskPatterns = new String();
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.isMask){
                    let tempC = maskItem.color;
                    let tempR = maskItem.rotation;
                    if(!maskItem.isFiller){//all but filler
                        maskItem.color = "#000000";
                        maskItem.borderColor = "#000000";
                    }else{//filler only
                        maskItem.rotation = 0;
                        maskItem.color = "#ffffff";
                        maskItem.borderColor = "#ffffff";
                    }
                    maskPatterns += maskItem.cleanHTML(limitPrecision);
                    maskItem.color = tempC;
                    maskItem.borderColor = tempC;
                    maskItem.rotation = tempR;
                }
            }
            let maskString = '<defs><mask id="'+this.id+'mask">'+maskPatterns+'</mask></defs>';
            return maskString;
        }else{
            return "<defs></defs>";
        }
    }
    /**
     * Updates properties that depend on others but are not directly set.
     */
     updateProperties(){}
    /**
     * Should be overwritten by sub classes
     */
    getMarkers(){
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    getLines(){
        return [];
    }
    additionalOptions(x, y){
        return [];
    }
    markerClicked(marker){

    }
    afterAlteration(){

    }
    /**
     * Gets called when a marker of a pattern that is edited is changed.
     * @param {Object} Marker the marker that has been changed. Contains new x,y and memorize
     * @returns the changes that should be done to the pattern
     */
    markerEdited(marker){
        return {};
    }
    /**
     * Rotates a point around the patterns center by as much as the pattern itself is rotated
     */
    rotatePoint(point, reverse = false){
        if(this.center === undefined || this.rotation === undefined){
            console.warn("using rotatePoint() requires center and rotation");
        }
        let rotation = (reverse)?-this.rotation:this.rotation;
        return PointOperations.rotateAroundPoint(this.center, point, rotation);
    };
    systemHTML(){
        return this.cleanHTML().slice(0,-2)+' svg-editor-type="mainPattern"/>';
    }
    fullHTML(systemAttributes = false, limitPrecision = false){
        return ((this.hasMask())?this.mask(limitPrecision):"") + ((systemAttributes)?this.systemHTML():this.cleanHTML(limitPrecision));
    }
    /**
     * Returns the JSON representation of this pattern.
     */
    get(){
        let obj = super.get(); 
        let additionalAttributes = {
            type: "pattern",
            attributes:{
                id: this.id,
                display: this.display,
                isMask: this.isMask,
                isFiller: this.isFiller,//the filler is always identical to the main pattern
                maskLayer: (!this.isMask)?this.maskLayer.get():undefined,
                boundId: this.boundId,
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin
            }
        }
        Object.assign(obj, additionalAttributes);
        return obj;
    }
    load(patternJSON, trueCopy = true){
        patternJSON = this.copy(patternJSON);//copy attributes so no objects are shared between pattern and other pattern
        //check for correct data-type
        if(this.constructor.name != patternJSON.subtype){
            console.trace();
            console.error(`Cannot load ${this.constructor.name} from ${patternJSON.subtype}`);
            return;
        }
        //if this pattern has been given a mask layer, load the passed data into it
        if(this.maskLayer){
            this.maskLayer.load(patternJSON.attributes.maskLayer, trueCopy);
        }
        delete patternJSON.attributes.maskLayer;
        if(!trueCopy) delete patternJSON.attributes.id;
        Object.assign(this,patternJSON.attributes);
        //add filler for mask
        if(this.maskLayer){
            let filler = this.maskLayer.patterns[this.id+"filler"];
            filler.load(patternJSON, false);
            filler.id = this.id+"filler";
            filler.display = false;
            filler.isMask = true;
            filler.isFiller = true;
        }
    }
}