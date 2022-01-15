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
    //@Override
    getMarkers(){
        let r = [];
        let angle = PointOperations.angle(this.vector);
        r.push([this.xOrigin,this.yOrigin,"start","point", angle]);
        r.push([this.xEnd,this.yEnd,"end", "point", angle]);
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xEnd,this.yEnd, this.width/2 + 10, "top");
        r.push([...widthMarkerPos,"width","arrow-double", angle]);
        return r;
    }
    //@Override
    getLines(){
        let l = [];
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xEnd,this.yEnd, this.width/2 + 10, "top");
        l.push([PointOperations.halfway(this.xOrigin, this.xEnd),PointOperations.halfway(this.yOrigin, this.yEnd),widthMarkerPos[0],widthMarkerPos[1]]);
        return l;
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