class Path extends Pattern{

    displayCurveMarkersSpaceLimit = 40;
    allowManuelPointDeleteDistance = 20;
    defaultEdgeRounderDistance = 15;

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
    getPoint(index){
        if(index < this.points.length && index >= 0){
            return this.points[index];
        }
        if(index === -1){
            return {x:this.xOrigin, y:this.yOrigin};
        }
        console.trace();
        console.error("Tryed to access not existant point in path");
        return undefined;
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
        }else{
            return this.boundingRect;
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
    //@Override
    additionalOptions(x, y, callback){
        let options =  [
            {
                label:"add",
                icon:"img/add_plus.svg",
                clickHandler:()=>{this.addPoint(x, y);this.updateProperties();callback();},
                type:"custom"
            }
        ]
        if(this.getPointsByDistance(x, y).distance[0] <= this.allowManuelPointDeleteDistance){
            options.push({
                    label:"remove",
                    icon:"img/remove_minus.svg",
                    clickHandler:()=>{this.removePoint(x, y);this.updateProperties();callback();},
                    type:"custom"
                })
        }
        return options;
    }
    addPoint(x, y){
        //get the closest edge
        let distances = [];
        let originalPosPointA = [];
        for(let i = 0; i < this.points.length; i++){
            let pointA = this.getPoint(i-1);
            let pointB = this.points[i];
            let distance = PointOperations.lineDistance(x, y, ...this.rotatePoint([pointA.x, pointA.y]), ...this.rotatePoint([pointB.x, pointB.y]));
            let index = 0;
            while(distances[index] != undefined && distances[index] < distance){
                index++;
            }
            distances.splice(index, 0, distance);
            originalPosPointA.splice(index, 0, parseInt(i)-1);
        }
        let newPointPos = this.rotatePoint([x,y], true);
        let newPoint = {
            x:newPointPos[0],
            y:newPointPos[1],
            method:"L",
            extraX:10,
            extraY:10,
            type:"round"
        }
        this.points.splice(originalPosPointA[0]+1, 0, newPoint);
    }
    getPointsByDistance(x, y){
        //get the closest edge
        let distances = [];
        let originalPosPoint = [];
        for(let i = 0; i < this.points.length; i++){
            let point = this.points[i];
            let realPoint = this.rotatePoint([point.x, point.y]);
            let distance = PointOperations.vectorLength([realPoint[0] - x, realPoint[1] - y]);
            let index = 0;
            while(distances[index] != undefined && distances[index] < distance){
                index++;
            }
            distances.splice(index, 0, distance);
            originalPosPoint.splice(index, 0, i);
        }
        return {
            index:originalPosPoint,
            distance:distances
        }
    }
    removePoint(x, y, distanceLimit = 512){
        //get the closest point
        let byDistance = this.getPointsByDistance(x, y);
        if(byDistance.distance[0] > distanceLimit){
            return;
        }
        //keep at least 3 points
        if(this.points.length <= 3){
            console.error("Cannot remove the last 2 points of path");
            return;
        }
        //if last point, move origin
        if(parseInt(byDistance.index[0]) === this.points.length - 1){
            this.xOrigin = this.points[this.points.length - 2].x;
            this.yOrigin = this.points[this.points.length - 2].y;
        }
        this.points.splice(byDistance.index[0], 1);
    }
    getPointsString(){
        let pointsString = new Array();
        this.points.forEach((point, index) => {
            let elementString = new String();
            //method
            elementString += point.method+" ";
            //curve point
            if(["Q"].indexOf(point.method) !== -1){
                elementString += point.extraX+" "+point.extraY+" ";
            }
            let rounderDistance = (point.rounderDistance == undefined)?this.defaultEdgeRounderDistance:point.rounderDistance;
            switch (point.type) {
                case "round":
                    //BOTH IF and ELSE have to be adjusted
                    //the main point will be replaced by two points witha curve between them
                    if(index != this.points.length - 1 && this.points.length > 1){
                        //get the last point a line was draw to before the main point
                        let lastPoint = (point.method == "L")?[this.getPoint(index-1).x, this.getPoint(index-1).y]:[point.extraX,point.extraY];
                        //get the next point a line will be draw to after the main point
                        let nextPoint = (this.points[index+1].method == "L")?[this.points[index+1].x, this.points[index+1].y]:[this.points[index+1].extraX,this.points[index+1].extraY];
                        //get the 2 new points to round of the single point
                        let toLastPointVector = [lastPoint[0]-point.x, lastPoint[1]-point.y];
                        let toNextPointVector = [nextPoint[0]-point.x, nextPoint[1]-point.y];
                        //limit the distance of the rounder points from the main point, so the rounder points are not place behind the last/next point
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));
                        //set the distance of the rounder points from the main point
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x+toLastPointVector[0],point.y+toLastPointVector[1]];
                        let secondRounderPoint = [point.x+toNextPointVector[0],point.y+toNextPointVector[1]];
                        elementString += firstRounderPoint[0]+" "+firstRounderPoint[1]+" ";
                        elementString += "Q "+point.x+" "+point.y+" ";
                        elementString += secondRounderPoint[0]+" "+secondRounderPoint[1]+" ";
                        break;
                    }else if(index === this.points.length - 1){
                        //last point (equals the position of origin)
                        //get the last point a line was draw to before the main point
                        let lastPoint = (point.method == "L")?[this.getPoint(index-1).x, this.getPoint(index-1).y]:[point.extraX,point.extraY];
                        //get the next point a line will be draw to after the main point (which is the first point again)
                        let nextPoint = (this.points[0].method == "L")?[this.points[0].x, this.points[0].y]:[this.points[0].extraX,this.points[0].extraY];
                        //get the 2 new points to round of the single point
                        let toLastPointVector = [lastPoint[0]-point.x, lastPoint[1]-point.y];
                        let toNextPointVector = [nextPoint[0]-point.x, nextPoint[1]-point.y];
                        //limit the distance of the rounder points from the main point, so the rounder points are not place behind the last/next point
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));
                        //set the distance of the rounder points from the main point
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x+toLastPointVector[0],point.y+toLastPointVector[1]];
                        let secondRounderPoint = [point.x+toNextPointVector[0],point.y+toNextPointVector[1]];
                        elementString += firstRounderPoint[0]+" "+firstRounderPoint[1]+" ";
                        elementString += "Q "+point.x+" "+point.y+" ";
                        elementString += secondRounderPoint[0]+" "+secondRounderPoint[1]+" ";
                        //start pointsString with the last point (start point = end point)
                        pointsString = secondRounderPoint[0]+" "+secondRounderPoint[1]+" "+pointsString;
                        break;
                    }
                default:
                    //main point
                    elementString += point.x+" "+point.y+" ";
                    //if last element, add final point as first point (start point = end point)
                    if(index === this.points.length - 1){
                        pointsString = point.x+" "+point.y+" "+pointsString;
                    }
                    break;
            }
            pointsString += elementString;
        });
        return pointsString;
    }
    //@Override
    getMarkers(){
        let r = [];
        //position of rotation marker
        r.push([...this.rotatePoint(PointOperations.orthogonalIcon(this.boundingRect.x,this.boundingRect.y,this.boundingRect.x + this.boundingRect.width,this.boundingRect.y, this.rotationMarkerDistanceFromPattern, "top")),"rotate", "arrow-rotate", this.rotation]);
        for(let index in this.points){
            let point = this.points[index];
            let rotatedPoint = this.rotatePoint([point.x,point.y]);
            //normal point
            r.push([...rotatedPoint,parseInt(index),"point"]);
            //for extra point
            let lastPoint = this.getPoint(index - 1);
            //if extra point is Quadratic
            if(["Q"].indexOf(point.method) !== -1){
                //add marker on the point
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                r.push([...rotatedExtraPoint,"extra"+index,"curve"]);
            }else{
                //if distance from last point is great enough to draw another marker
                if(PointOperations.vectorLength([point.x-lastPoint.x,point.y-lastPoint.y]) > this.displayCurveMarkersSpaceLimit){
                    //add marker halfway between last point and current
                    let rotatedLastPoint = this.rotatePoint([lastPoint.x,lastPoint.y]);
                    r.push([PointOperations.halfway(rotatedPoint[0],rotatedLastPoint[0]),PointOperations.halfway(rotatedPoint[1],rotatedLastPoint[1]),"extra"+index,"curve"]);
                }
            }
        }
        return r;
    }
    //@Override
    getLines(){
        let  l = [];
        for(let index in this.points){
            let point = this.points[index];
            let lastPoint = this.getPoint(index - 1);
            //if extra point is Quadratic
            if(["Q"].indexOf(point.method) !== -1){
                //add lines
                let rotatedLastPoint = this.rotatePoint([lastPoint.x,lastPoint.y]);
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                let rotatedPoint = this.rotatePoint([point.x,point.y]);
                l.push([...rotatedLastPoint, ...rotatedExtraPoint]);
                l.push([...rotatedPoint,...rotatedExtraPoint]);
            }
        }
        return l;
    }
    cleanHTML(){
        let defaultPattern = new Path(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let pointsString = this.getPointsString();
        let cleanHTML = ''
        +'<path '+ ((this.hasMask())?this.maskLink():'')
        +' d="M '+pointsString+'Z"'
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
            center: this.center,
            boundingRect: this.boundingRect
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
}