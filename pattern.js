class Pattern extends IconCreatorGlobal{
    
    display = true;

    isUI = false;
    isMask = false;
    isFiller = false;//the filler is always identical to the main pattern
    maskLayer;
    boundId;

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
                if(maskItem.id != this.id){//if not the pattern that this mask belongs to
                    
                    let xDiff = maskItem.xOrigin - this.xOrigin;
                    let yDiff = maskItem.yOrigin - this.yOrigin;
                    maskItem.translateTo(newMainOriginX + xDiff,newMainOriginY + yDiff);
                }
            }
        }
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
     * Updates properties that depend on others but are not directly set.
     */
    updateProperties(){}
    mirrorVertically(){
        if(!this.isMask){
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.id != this.id && !maskItem.isFiller){//if not the pattern that this mask belongs to and not the filler
                    maskItem.mirrorVertically();
                }
            }
        }
    }
    mirrorHorizontally(){
        if(!this.isMask){
            for(let pos in this.maskLayer.renderOrder){
                let id = this.maskLayer.renderOrder[pos];
                let maskItem = this.maskLayer.patterns[id];
                if(maskItem.id != this.id && !maskItem.isFiller){//if not the pattern that this mask belongs to and not the filler
                    maskItem.mirrorHorizontally();
                }
            }
        }
    }
    mask(){//return patterns in mask layer as html
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
                    }
                    maskPatterns += maskItem.cleanHTML();
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
    systemHTML(){
        return this.cleanHTML().slice(0,-2)+' svg-editor-type="mainPattern"/>';
    }
    fullHTML(systemAttributes = false){
        return ((this.hasMask())?this.mask():"") + ((systemAttributes)?this.systemHTML():this.cleanHTML());
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
    load(patternJSON){
        //check for correct data-type
        if(this.constructor.name != patternJSON.subtype){
            console.trace();
            console.error(`Cannot load ${this.constructor.name} from ${patternJSON.subtype}`);
            return;
        }
        //if this pattern has been given a mask layer, load the passed data into it
        if(this.maskLayer){
            this.maskLayer.load(patternJSON.attributes.maskLayer);
            this.maskLayer.append(this);
            console.log(this.maskLayer);
        }
        delete patternJSON.attributes.maskLayer;
        Object.assign(this,patternJSON.attributes);
    }
}
class Rect extends Pattern{
    
    allowMask = true;
    rotation = 0;
    center = [0,0];
    
    constructor(x,y, height = 1, width = 1, color = "#000000", borderWidth = 0, borderColor = "#000000", stroke = ""){
        super(x,y);
        this.height = height;
        this.width = width;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.stroke = stroke;

        this.updateProperties();
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = this.getCenterUntransformed();
    }
    getCenterUntransformed(){
        return [(this.xOrigin + this.xOrigin+this.width)/2,(this.yOrigin + this.yOrigin + this.height)/2];
    }
    getCenterProjection(){
        let topLeft = this.topLeft();
        let bottomRight = this.bottomRight();
        return [(topLeft[0] + bottomRight[0])/2,(topLeft[1] + bottomRight[1])/2];
    }
    /**
     * Translates the pattern, so that projection (rotated rectangle) and rectangle share the same center point. This is important for rotations to always transform around the visual center of the rectangle.
     */
    matchCenters(){
        let realCenter = this.getCenterUntransformed();
        let projectionCenter = this.getCenterProjection();
        let difference = [projectionCenter[0] - realCenter[0], projectionCenter[1] - realCenter[1]];
        this.translateTo(this.xOrigin + difference[0], this.yOrigin + difference[1]);
    }
    mirrorVertically(){
        super.mirrorVertically();
        this.rotation = 360-this.rotation;
    }
    mirrorHorizontally(){
        super.mirrorHorizontally();
        this.rotation = 180-this.rotation;
        if(this.rotation < 0){
            this.rotation = 360 + this.rotation;
        }
    }
    updateProperties(){
        if(this.rotation != 0){
            this.matchCenters();
        }
        this.center = this.getCenterUntransformed();
    }
    topLeft(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin,this.yOrigin],this.rotation);
    }
    topRight(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin+this.width,this.yOrigin],this.rotation);
    }
    bottomLeft(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin, this.yOrigin+this.height], this.rotation)
    }
    bottomRight(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin+this.width, this.yOrigin + this.height], this.rotation)
    }
    /**
     * Get the svg-html string without mask or editor specific attributes
     * @returns 
     */
    cleanHTML(){
        let defaultPattern = new Rect(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
        +'<rect '+ ((this.hasMask())?this.maskLink():'')
        +' x="'+this.xOrigin
        +'" y="'+this.yOrigin
        +'" width="'+this.width
        +'" height="'+this.height
        +'" fill="'+this.color
        +'" '+(paintBorder?`stroke="${this.borderColor}" `:'')
        +(paintBorder?`stroke-width="${this.borderWidth}" `:'')
        +((this.stroke != defaultPattern.stroke)?`stroke-dasharray="${this.stroke}" `:'')
        +((this.rotation != defaultPattern.rotation)?`transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" `:'')
        +'/>';
        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
     get(allowMask = true){
        let obj = super.get(allowMask); 
        obj.subtype = this.constructor.name;
        let additionalAttributes = {
            width: this.width,
            height: this.height,
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            stroke: this.stroke,
            rotation: this.rotation,
            center: this.center
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}
class Circle extends Pattern{

    allowMask = true;

    constructor(x,y, radius = 1, color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.radius = radius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
    }
    mirrorVertically(){
        super.mirrorVertically();
    }
    mirrorHorizontally(){
        super.mirrorHorizontally();
    }
    cleanHTML(){
        let defaultPattern = new Circle(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
        +'<circle '+ ((this.hasMask())?this.maskLink():'')
        +' cx="'+this.xOrigin
        +'" cy="'+this.yOrigin
        +'" r="'+this.radius
        +'" fill="'+this.color
        +'" '+(paintBorder?`stroke="${this.borderColor}" `:'')
        +(paintBorder?`stroke-width="${this.borderWidth}" `:'')
        +'/>';
        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
     get(allowMask = true){
        let obj = super.get(allowMask); 
        obj.subtype = this.constructor.name;
        let additionalAttributes = {
            radius: this.radius,
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}
class Ellipse extends Pattern{

    allowMask = true;
    rotation = 0;
    center = [0,0];

    constructor(x,y, xRadius = 1, yRadius = 1, color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.xRadius = xRadius;
        this.yRadius = yRadius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = [this.xOrigin, this.yOrigin];
    }
    top(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin, this.yOrigin - this.yRadius], this.rotation);
    }
    right(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin + this.xRadius, this.yOrigin], this.rotation);
    }
    bottom(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin, this.yOrigin + this.yRadius], this.rotation);
    }
    left(){
        return PointOperations.rotateAroundPoint(this.center,[this.xOrigin - this.xRadius, this.yOrigin], this.rotation);
    }
    mirrorVertically(){
        super.mirrorVertically();
        this.rotation = 360-this.rotation;
    }
    mirrorHorizontally(){
        super.mirrorHorizontally();
        this.rotation = 180-this.rotation;
        if(this.rotation < 0){
            this.rotation = 360 + this.rotation;
        }
    }
    updateProperties(){
        this.center = [this.xOrigin, this.yOrigin];
    }
    cleanHTML(){
        let defaultPattern = new Ellipse(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
        +'<ellipse '+ ((this.hasMask())?this.maskLink()+' ':'')
        +'cx="'+this.xOrigin
        +'" cy="'+this.yOrigin
        +'" rx="'+this.xRadius
        +'" ry="'+this.yRadius
        +'" fill="'+this.color
        +'" '+(paintBorder?`stroke="${this.borderColor}" `:'')
        +(paintBorder?`stroke-width="${this.borderWidth}" `:'')
        +((this.rotation != defaultPattern.rotation)?`transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" `:'')
        +'/>';
        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
     get(allowMask = true){
        let obj = super.get(allowMask); 
        obj.subtype = this.constructor.name;
        let additionalAttributes = {
            xRadius: this.xRadius,
            yRadius: this.yRadius,
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            rotation:this.rotation,
            center:this.center
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}
class Line extends Pattern{

    allowMask = false;

    constructor(x,y, xEnd = 1, yEnd = 1, color = "#000000", width = 3, stroke = ""){
        super(x,y);
        this.xEnd = xEnd;
        this.yEnd = yEnd;
        this.color = color;
        this.width = width;
        this.stroke = stroke;
        this.vector = [0,0];
    }
    translateTo(newOriginX, newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xEnd = (this.xEnd - this.xOrigin) + newOriginX;
        this.yEnd = (this.yEnd - this.yOrigin) + newOriginY;
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
    }
    updateProperties(){
        this.vector = this.getVector();
    }
    getVector(){
        return [this.xEnd - this.xOrigin,this.yEnd - this.yOrigin];
    }
    mirrorVertically(){
        super.mirrorVertically();
        let temp = this.xOrigin;
        this.xOrigin = this.xEnd;
        this.xEnd = temp;
        this.updateProperties();
    }
    mirrorHorizontally(){
        super.mirrorHorizontally();
        let temp = this.yOrigin;
        this.yOrigin = this.yEnd;
        this.yEnd = temp;
        this.updateProperties();
    }
    cleanHTML(){
        let defaultPattern = new Line(0,0);
        let cleanHTML = ''
        +'<line'
        +' x1="'+this.xOrigin
        +'" y1="'+this.yOrigin
        +'" x2="'+this.xEnd
        +'" y2="'+this.yEnd
        +'" stroke="'+this.color
        +'" fill="'+this.color
        +'" stroke-width="' + this.width + '" '
        +((this.stroke != defaultPattern.stroke)?`stroke-dasharray="${this.stroke}" `:'')
        +' stroke-linecap="round" />';
        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
     get(allowMask = true){
        let obj = super.get(allowMask); 
        obj.subtype = this.constructor.name;
        let additionalAttributes = {
            xEnd: this.xEnd,
            yEnd: this.yEnd,
            color: this.color,
            width: this.width,
            stroke: this.stroke,
            vector: this.vector
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}
class Path extends Pattern{

    rotation = 0;
    center = [0,0];
    allowMask = true;
    boundingRect = {
        x:0,
        y:0,
        width:1,
        height:1
    }

    constructor(x,y, points = new Array(), color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.points = points;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        for(let i in this.points){
            let point = this.points[i];
            if(["Q"].indexOf(point.method) !== -1){
                point.extraX = (point.extraX - this.xOrigin) + newOriginX;
                point.extraY = (point.extraY - this.yOrigin) + newOriginY;
            }
            point.x = (point.x - this.xOrigin) + newOriginX;
            point.y = (point.y - this.yOrigin) + newOriginY;
        }
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.boundingRect = this.getBoundingRect();
        this.center = this.getCenterUntransformed();
    }
    updateProperties(){
        this.boundingRect = this.getBoundingRect();
        if(this.rotation != 0){
            this.matchCenters();
        }
        this.center = this.getCenterUntransformed();
    }
    getBoundingRect(){
        if(this.points.length != 0){
            try{
                //topmost,bottommost,leftmost,rightmost
                let top = this.points[0].y;
                let bottom = this.points[0].y;
                let left = this.points[0].x;
                let right = this.points[0].x;
                for(let i in this.points){
                    if(this.points[i].y < top){
                        top = this.points[i].y;
                    }
                    if(this.points[i].y > bottom){
                        bottom = this.points[i].y;
                    }
                    if(this.points[i].x < left){
                        left = this.points[i].x;
                    }
                    if(this.points[i].x > right){
                        right = this.points[i].x;
                    }
                }
                return {
                    x: left,
                    y: top,
                    height: bottom - top,
                    width: right - left
                }
            }catch(e){
                console.log("Error in this path with getting bounding rect:", this);
            }
        }
    }
    getCenterProjection(){
        return PointOperations.rotateAroundPoint(this.center, this.getCenterUntransformed(), this.rotation);
    }
    /**
     * Translates the pattern, so that projection (rotated poly) and poly share the same center point. This is important for rotations to always transform around the visual center of the poly.
     */
    matchCenters(){
        let realCenter = this.getCenterUntransformed();
        let projectionCenter = this.getCenterProjection();
        let difference = [projectionCenter[0] - realCenter[0], projectionCenter[1] - realCenter[1]];
        this.translateTo(this.xOrigin + difference[0], this.yOrigin + difference[1]);
    }
    getCenterUntransformed(){
        return PointOperations.rectCenter(this.boundingRect);
    }
    mirrorVertically(){
        super.mirrorVertically();
        this.xOrigin = this.xOrigin + (this.center[0] - this.xOrigin)*2;
        this.points.forEach(point => {
            point.x = point.x + (this.center[0] - point.x)*2;
            if(["Q"].indexOf(point.method) !== -1){
                point.extraX = point.extraX + (this.center[0] - point.extraX)*2;
            }
        });
        this.rotation = 360-this.rotation;
    }
    mirrorHorizontally(){
        super.mirrorHorizontally();
        this.yOrigin = this.yOrigin + (this.center[1] - this.yOrigin)*2;
        this.points.forEach(point => {
            point.y = point.y + (this.center[1] - point.y)*2;
            if(["Q"].indexOf(point.method) !== -1){
                point.extraY = point.extraY + (this.center[1] - point.extraY)*2;
            }
        });
        console.log(this.rotation);
        this.rotation = 360-this.rotation;
    }
    cleanHTML(){
        let defaultPattern = new Path(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let pointsString = new Array();
        this.points.forEach(point => {
            let elementString = new String();
            elementString += point.method+" ";
            if(["Q"].indexOf(point.method) !== -1){
                elementString += point.extraX+" "+point.extraY+" ";
            }
            elementString += point.x+ " "+point.y+" ";
            pointsString += elementString;
        });
        let cleanHTML = ''
        +'<path '+ ((this.hasMask())?this.maskLink():'')
        +' d="M '+this.xOrigin+' '+this.yOrigin+' '+pointsString+'Z"'
        +' fill="'+this.color
        +'" '+(paintBorder?`stroke="${this.borderColor}" `:'')
        +(paintBorder?`stroke-width="${this.borderWidth}" `:'')
        +((this.rotation%360 != defaultPattern.rotation)?` transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" `:'')
        +'/>';
        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
     get(allowMask = true){
        let obj = super.get(allowMask); 
        obj.subtype = this.constructor.name;
        let additionalAttributes = {
            points: this.copy(this.points),
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            rotation: this.rotation,
            center: this.center
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}