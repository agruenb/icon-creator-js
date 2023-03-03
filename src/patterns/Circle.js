import Pattern from "./Pattern";

import PointOperations from "../shared/PointOperations.js";

export default class Circle extends Pattern{

    allowMask = true;
    rotation = 0;
    defaultTranslation = [0,0];

    constructor(x,y, radius = 50, color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.radius = radius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        //static
        this.scaleMarkerDistance = 0;
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
    resize(scale, anchorPoint = this.center){
        //min width and heigh of 1
        if(scale > 1 || this.allowSizeDecrease()){
            this.radius = this.radius*scale;
        }else{
            console.warn("Cannot resize Circle further");
        }
    }
    allowSizeDecrease(){
        return this.radius > 1;
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
        }else if(marker.memorize === "resize"){
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance/oldDistance);
            changes = {
                xOrigin:this.xOrigin,
                yOrigin:this.yOrigin,
                radius:this.radius
            };
        }
        return changes;
    }
    startActiveDraw(x, y){
        return({
            xOrigin: x,
            yOrigin: y,
            radius: 10
        });
    }
    movedActiveDraw(x, y){
        return({
            radius: this.pt(Math.max(10, PointOperations.distance(this.xOrigin, this.yOrigin, x, y)))
        });
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
        //scale
        this.scaleMarkerPosition = [this.center[0]+this.radius+this.scaleMarkerDistance, this.center[1]+this.radius+this.scaleMarkerDistance];
        r.push([...this.scaleMarkerPosition,"resize","arrow-resize", 0]);
        return r;
    }
    icon(){
        return `
            <circle
            cx="4"
            cy="4"
            r="3"
            fill="${this.color}"
            ${(this.borderWidth > 0)?`stroke-width=1 stroke="${this.borderColor}"`:""}
            />
        `;
    }
    cleanHTML(){
        let defaultPattern = new Circle(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
        +'<circle '+ (this.maskReference())
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
    
    getClass(){
        return Circle;
    }
}