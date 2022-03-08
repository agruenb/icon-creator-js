class Line extends Pattern{

    allowMask = false;
    defaultTranslation = [-50,0];

    constructor(x,y, xEnd = 100, yEnd = 0, color = "#000000", width = 32, stroke = ""){
        super(x,y);
        this.xEnd = xEnd;
        this.yEnd = yEnd;
        this.color = color;
        this.width = width;
        this.stroke = stroke;
        this.vector = [0,0];
        this.updateProperties();
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
        this.center = this.getCenter();
    }
    getVector(){
        return [this.xEnd - this.xOrigin,this.yEnd - this.yOrigin];
    }
    getCenter(){
        return [PointOperations.halfway(this.xOrigin, this.xEnd),PointOperations.halfway(this.yOrigin, this.yEnd)];
    }
    mirrorVertically(xPos = this.center[0]){
        super.mirrorVertically(xPos);
        let newOrigin = PointOperations.mirrorPoint(xPos,"y",[this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        let newEnd = PointOperations.mirrorPoint(xPos,"y",[this.xEnd, this.yEnd]);
        this.xEnd = newEnd[0];
        this.yEnd = newEnd[1];
        this.updateProperties();
    }
    mirrorHorizontally(yPos = this.center[1]){
        super.mirrorVertically();
        let newOrigin = PointOperations.mirrorPoint(yPos,"x",[this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        let newEnd = PointOperations.mirrorPoint(yPos,"x",[this.xEnd, this.yEnd]);
        this.xEnd = newEnd[0];
        this.yEnd = newEnd[1];
        this.updateProperties();
    }
    //@Override
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        if(marker.memorize == "start"){
            let pointsDontOverlap = (marker.x != this.xEnd || marker.y != this.yEnd);
            changes = {
                xOrigin: (pointsDontOverlap)?marker.x:marker.x+limit,//prevent same start and endpoint
                yOrigin: (pointsDontOverlap)?marker.y:marker.y+limit
            }
        }else if(marker.memorize == "end"){//endX endY
            let pointsDontOverlap = (marker.x != this.xOrigin || marker.y != this.yOrigin);
            changes = {
                xEnd: (pointsDontOverlap)?marker.x:marker.x+limit,//prevent same start and endpoint
                yEnd: (pointsDontOverlap)?marker.y:marker.y+limit
            }
        }else if(marker.memorize == "width"){
            changes = {
                width: this.pt(2* PointOperations.lineDistance(marker.x, marker.y, this.xOrigin, this.yOrigin, this.xEnd, this.yEnd))
            }
        }
        return changes;
    }
    startActiveDraw(x, y){
        return({
            xOrigin: x,
            yOrigin: y,
            xEnd: x + 5,
            yEnd: y + 5
        });
    }
    movedActiveDraw(x, y){
        let pointsDontOverlap = (x != this.xOrigin || y != this.yOrigin);
        return({
            xEnd: (pointsDontOverlap)?x:x+5,//prevent same start and endpoint
            yEnd: (pointsDontOverlap)?y:y+5
        });
    }
    //@Override
    getMarkers(){
        let r = [];
        let angle = PointOperations.angle(this.vector);
        r.push([this.xOrigin,this.yOrigin,"start","point", angle]);
        r.push([this.xEnd,this.yEnd,"end", "point", angle]);
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xEnd,this.yEnd, this.width/2, "top");
        r.push([...widthMarkerPos,"width","arrow-double", angle]);
        return r;
    }
    //@Override
    getLines(){
        let l = [];
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xEnd,this.yEnd, this.width/2, "top");
        l.push([PointOperations.halfway(this.xOrigin, this.xEnd),PointOperations.halfway(this.yOrigin, this.yEnd),widthMarkerPos[0],widthMarkerPos[1]]);
        l.push([this.xOrigin, this.yOrigin, this.xEnd, this.yEnd,""]);
        return l;
    }
    icon(){
        return `
            <line
            x1="2"
            x2="6"
            y1="2"
            y2="6"
            stroke="${this.color}"
            stroke-width="2"
            stroke-linecap="round"
            />
        `;
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
        let additionalAttributes = {
            xEnd: this.xEnd,
            yEnd: this.yEnd,
            color: this.color,
            width: this.width,
            stroke: this.stroke,
            vector: this.vector,
            center: this.center
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}