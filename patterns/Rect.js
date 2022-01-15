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
    //@Override
    getMarkers(){
        let r = [];
        //rotate marker
        r.push([...this.rotatePoint(PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xOrigin+this.width,this.yOrigin, this.rotationMarkerDistanceFromPattern, "top")),"rotate","arrow-rotate", this.rotation]);
        //corner markers
        r.push([...this.topLeft(),"top left","point", this.rotation]);
        r.push([...this.topRight(),"top right","point", this.rotation]);
        r.push([...this.bottomLeft(),"bottom left","point", this.rotation]);
        r.push([...this.bottomRight(),"bottom right","point", this.rotation]);
        //side markers
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin,this.yOrigin],[this.xOrigin,this.yOrigin+this.height])),"left","arrow-double", this.rotation]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin+this.width,this.yOrigin],[this.xOrigin+this.width,this.yOrigin+this.height])),"right","arrow-double", this.rotation]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin,this.yOrigin],[this.xOrigin+this.width,this.yOrigin])),"top","arrow-double", this.rotation + 90]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin,this.yOrigin+this.height],[this.xOrigin+this.width,this.yOrigin+this.height])),"bottom","arrow-double", this.rotation + 90]);
        return r;
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