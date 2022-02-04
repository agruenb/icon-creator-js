class Circle extends Pattern{

    allowMask = true;
    rotation = 0;

    constructor(x,y, radius = 1, color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.radius = radius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.updateProperties();
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = [this.xOrigin, this.yOrigin];
    }
    updateProperties(){
        this.center = [this.xOrigin, this.yOrigin];
    }
    mirrorVertically(xPos = this.center[0]){
        super.mirrorVertically(xPos);
        if(this.isMask){
            this.rotation = 360-this.rotation;
        }
        this.xOrigin = PointOperations.mirrorPoint(xPos,"y",[this.xOrigin, this.yOrigin])[0];
        this.updateProperties();
    }
    mirrorHorizontally(yPos = this.center[1]){
        super.mirrorHorizontally(yPos);
        if(this.isMask){
            this.rotation = 180-this.rotation;
            if(this.rotation < 0){
                this.rotation = 360 + this.rotation;
            }
        }
        this.yOrigin = PointOperations.mirrorPoint(yPos,"x",[this.xOrigin, this.yOrigin])[1];
        this.updateProperties();
    }
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        if(marker.memorize == "rotate"){
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: parseInt(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        }else if(marker.memorize == "radius"){
            changes = {
                radius: this.pt(Math.max(limit, PointOperations.distance(this.xOrigin,this.yOrigin,marker.x,marker.y)))
            }
        }
        return changes;
    }
    //@Override
    getMarkers(){
        let r = [];
        let rotatePoint = [this.xOrigin, this.yOrigin - this.radius - this.rotationMarkerDistanceFromPattern];
        r.push([...this.rotatePoint(rotatePoint),"rotate", "arrow-rotate", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin+this.radius,this.yOrigin]),"radius", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin-this.radius,this.yOrigin]),"radius", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin,this.yOrigin+this.radius]),"radius", "arrow-double", this.rotation + 90]);
        r.push([...this.rotatePoint([this.xOrigin,this.yOrigin-this.radius]),"radius", "arrow-double", this.rotation + 90]);
        return r;
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
            radius: this.radius,
            color: this.color,
            center: this.center,
            rotation: this.rotation,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}