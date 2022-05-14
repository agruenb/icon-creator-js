class Rect extends Pattern{
    
    constructor(x,y, width = 100, height = 100, color = "#000000", borderWidth = 0, borderColor = "#000000", stroke = ""){
        super(x,y);
        this.height = height;
        this.width = width;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.stroke = stroke;
        //static props
        this.allowMask = true;
        this.rotation = 0;
        this.center = [0,0];
        this.scaleMarkerDistance = 20;
        this.updateProperties();
    }
    updateProperties(){
        if(this.rotation != 0){
            this.matchCenters();
        }
        this.center = this.getCenterUntransformed();
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
    mirrorVertically(xPos = this.center[0]){
        super.mirrorVertically(xPos);
        if(this.isMask){
            this.rotation = 360-this.rotation;
        }
        this.xOrigin = PointOperations.mirrorPoint(xPos,"y",[this.xOrigin+this.width, this.yOrigin])[0];
        this.center = this.getCenterUntransformed();
    }
    mirrorHorizontally(yPos = this.center[1]){
        super.mirrorHorizontally(yPos);
        if(this.isMask){
            this.rotation = 180-this.rotation;
        }
        this.yOrigin = PointOperations.mirrorPoint(yPos,"x",[this.xOrigin, this.yOrigin+this.height])[1];
        this.center = this.getCenterUntransformed();
    }
    resize(scale, anchorPoint = this.center){
        //min width and heigh of 1
        if(scale > 1 || (this.width > 1 && this.height > 1)){
            let origin = [this.xOrigin, this.yOrigin];
            let newOrigin = PointOperations.scalePoint(origin, anchorPoint, scale);
            let widthChange = origin[0] - newOrigin[0];
            let heightChange = origin[1] - newOrigin[1];
            this.width += widthChange*2;
            this.height += heightChange*2;
            this.xOrigin = newOrigin[0];
            this.yOrigin = newOrigin[1];
        }else{
            console.warn("Cannot resize Rect further");
        }
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
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        if(marker.memorize == "rotate"){
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: parseInt(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        }else if(marker.memorize == "top left"){
            let newHeight = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.bottomLeft(),...this.bottomRight()));
            let newWidth = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.bottomRight(),...this.topRight()));
            changes = {
                width: newWidth,
                height: newHeight,
                xOrigin: this.xOrigin - (newWidth - this.width),
                yOrigin: this.yOrigin - (newHeight - this.height)
            }
        }else if(marker.memorize == "top right"){
            let newHeight = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.bottomLeft(),...this.bottomRight()));
            changes = {
                width: PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.bottomLeft()),
                height: newHeight,
                yOrigin: this.yOrigin - (newHeight - this.height)
            }
        }else if(marker.memorize == "bottom left"){
            let newWidth = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.topRight(),...this.bottomRight()));
            changes = {
                width: newWidth,
                height: PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.topRight()),
                xOrigin: this.xOrigin - (newWidth - this.width)
            }
        }else if(marker.memorize == "bottom right"){
            changes = {
                width: this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.bottomLeft())),
                height: this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.topRight()))
            }
        }else if(marker.memorize == "top"){
            let newHeight = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.bottomLeft(),...this.bottomRight()));
            changes = {
                yOrigin: this.yOrigin - (newHeight - this.height),
                height: newHeight
            }
        }else if(marker.memorize == "bottom"){
            changes = {
                height: this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.topRight()))
            }
        }else if(marker.memorize == "left"){
            let newWidth = this.pt(PointOperations.lineDistance(marker.x,marker.y,...this.topRight(),...this.bottomRight()));
            changes = {
                xOrigin: this.xOrigin - (newWidth - this.width),
                width: newWidth
            }
        }else if(marker.memorize == "right"){
            changes = {
                width: PointOperations.lineDistance(marker.x,marker.y,...this.topLeft(),...this.bottomLeft())
            }
        }else if(marker.memorize === "resize"){
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance/oldDistance);
            changes = {
                xOrigin:this.xOrigin,
                yOrigin:this.yOrigin,
                height:this.height,
                width:this.width
            };
        }
        return changes;
    }
    startActiveDraw(x, y){
        this.activeOrigin = [x, y];
        return({
            xOrigin: x,
            yOrigin: y,
            height: 1,
            width: 1
        });
    }
    movedActiveDraw(x, y){
        let ogX = this.activeOrigin[0];
        let ogY = this.activeOrigin[1];
        if(ogX > x && ogY > y){//top left
            return {
                width: ogX - x,
                height: ogY - y,
                xOrigin: x,
                yOrigin: y
            }
        }else if(ogX > x && ogY < y){//bottom left
            return {
                width: ogX - x,
                height:  y - ogY,
                xOrigin: x,
                yOrigin: ogY
            }
        }else if(ogX < x && ogY > y){//top right
            return {
                width: x - ogX,
                height: ogY - y,
                xOrigin: ogX,
                yOrigin: y
            }
        }else if(ogX < x && ogY < y){//bottom right
            return {
                width: x - ogX,
                height: y - ogY,
                xOrigin: ogX,
                yOrigin: ogY
            }
        }else{//height or width is 0
            return {};
        }
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
        //scale
        this.scaleMarkerPosition = [this.center[0]+this.width/2+this.scaleMarkerDistance, this.center[1]+this.height/2+this.scaleMarkerDistance];
        r.push([...this.scaleMarkerPosition,"resize","arrow-resize", 0]);
        return r;   
    }
    icon(){
        return `
            <rect
            x="1.5"
            y="1.5"
            height="5"
            width="5"
            fill="${this.color}"
            ${(this.borderWidth > 0)?`stroke-width=1 stroke="${this.borderColor}"`:""}
            />
        `;
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