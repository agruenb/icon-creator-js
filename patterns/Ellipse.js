class Ellipse extends Pattern{

    allowMask = true;
    rotation = 0;
    center = [0,0];
    defaultTranslation = [0,0]

    constructor(x,y, xRadius = 50, yRadius = 30, color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.xRadius = xRadius;
        this.yRadius = yRadius;
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
    updateProperties(){
        this.center = [this.xOrigin, this.yOrigin];
    }
    //@Override
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        if(marker.memorize == "rotate"){
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: parseInt(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        }else if(marker.memorize == "xRadius"){
            changes = {
                xRadius: this.pt(Math.max(limit, PointOperations.lineDistance(marker.x,marker.y,...this.top(),...this.bottom())))
            }
        }else if(marker.memorize == "yRadius"){
            changes = {
                yRadius: this.pt(Math.max(limit, PointOperations.lineDistance(marker.x,marker.y,...this.left(),...this.right())))
            }
        }
        return changes;
    }
    startActiveDraw(x, y){
        return({
            xOrigin: x,
            yOrigin: y,
            xRadius: 10,
            yRadius: 15
        });
    }
    movedActiveDraw(x, y){
        return({
            xRadius: this.pt(Math.max(10, PointOperations.lineDistance(x,y,...this.top(),...this.bottom()))),
            yRadius: this.pt(Math.max(10, PointOperations.lineDistance(x,y,...this.left(),...this.right()))),
        });
    }
    //@Override
    getMarkers(){
        let r = [];
        let vectorFromCenter = PointOperations.trimVectorLength([0,-this.xRadius], this.yRadius + this.rotationMarkerDistanceFromPattern);
        let rotationMarkerPoint = [this.xOrigin + vectorFromCenter[0], this.yOrigin + vectorFromCenter[1]];
        r.push([...this.rotatePoint(rotationMarkerPoint),"rotate", "arrow-rotate", this.rotation]);
        r.push([...this.top(),"yRadius", "arrow-double", this.rotation+90]);
        r.push([...this.right(),"xRadius", "arrow-double", this.rotation]);
        r.push([...this.left(),"xRadius", "arrow-double", this.rotation]);
        r.push([...this.bottom(),"yRadius", "arrow-double", this.rotation+90]);
        return r;
    }
    icon(){
        return `
            <ellipse
            cx="4"
            cy="4"
            rx="3.5"
            ry="2.5"
            fill="${this.color}"
            ${(this.borderWidth > 0)?`stroke-width=1 stroke="${this.borderColor}"`:""}
            />
        `;
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

