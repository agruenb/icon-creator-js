import Pattern from "./Pattern";
import UniversalOps from "../shared/UniversalOps";
import PointOperations from "../shared/PointOperations.js";

export default class Path extends Pattern{

    displayCurveMarkersSpaceLimit = 40;
    allowManuelPointEditDistance = 20;
    defaultEdgeRounderDistance = 15;
    cancelActiveDrawDistance = 20;
    allowArcRoundingRatio = 0.45;//max 0.5
    arcSmoothingDistance = 5;

    rotation = 0;
    center = [0,0];
    allowMask = true;
    boundingRect = {
        x:0,
        y:0,
        width:1,
        height:1
    }

    constructor(x,y, points = [
        {x:100,y:100,method:"L",type:"round",extraX:50,extraY:50},
        {x:0,y:100,method:"L",type:"round",extraX:50,extraY:100},
        {x:0,y:0,method:"L",type:"round",extraX:0,extraY:50}
    ], color = "#000000", borderWidth = 0, borderColor = "#000000"){
        super(x,y);
        this.points = points;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.updateProperties();
    }
    translateTo(newOriginX,newOriginY){
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        for(let i in this.points){
            let point = this.points[i];
            point.extraX = (point.extraX - this.xOrigin) + newOriginX;
            point.extraY = (point.extraY - this.yOrigin) + newOriginY;
            point.x = (point.x - this.xOrigin) + newOriginX;
            point.y = (point.y - this.yOrigin) + newOriginY;
        }
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.updateProperties();
    }
    getPoint(index){
        if(index < this.points.length && index >= 0){
            return this.points[index];
        }else
        if(index === -1){
            return {x:this.xOrigin, y:this.yOrigin};
        }else
        if(index == this.points.length){
            return this.points[0];
        }
        console.trace();
        console.error("Tryed to access not existant point "+index+" in path");
        return undefined;
    }
    afterAlteration(){
        this.matchCenters();
    }
    updateProperties(){
        this.boundingRect = this.getBoundingRect();
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
    /**
     * Get the current center rotated around the center attribute. !!!ACCESSES the this.center variable
     * @returns 
     */
    getCenterProjection(){
        return PointOperations.rotateAroundPoint(this.center, this.getCenterUntransformed(), this.rotation);
    }
    /**
     * Translates the pattern, so that projection (rotated poly) and poly share the same center point. This is important for rotations to always transform around the visual center of the poly.
     * !!!DONT call after updateProperties() as matchCenters accesses the old center
     */
    matchCenters(){
        if(this.rotation != 0){
            let realCenter = this.getCenterUntransformed();
            let projectionCenter = this.getCenterProjection();
            let difference = [projectionCenter[0] - realCenter[0], projectionCenter[1] - realCenter[1]];
            this.translateTo(this.xOrigin + difference[0], this.yOrigin + difference[1]);
        }
    }
    getCenterUntransformed(){
        return PointOperations.rectCenter(this.getBoundingRect());
    }
    mirrorVertically(xPos = this.center[0]){
        super.mirrorVertically(xPos);
        let newOrigin = PointOperations.mirrorPoint(xPos,"y",[this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        this.points.forEach(point => {
            let newPoint = PointOperations.mirrorPoint(xPos,"y",[point.x, point.y]);
            point.x = newPoint[0];
            point.y = newPoint[1];
            let newPointExtra = PointOperations.mirrorPoint(xPos,"y",[point.extraX, point.extraY]);
            point.extraX = newPointExtra[0];
            point.extraY = newPointExtra[1];
        });
        if(this.isMask){
            this.rotation = 360-this.rotation;
        }
        this.updateProperties();
    }
    mirrorHorizontally(yPos = this.center[1]){
        super.mirrorHorizontally(yPos);
        let newOrigin = PointOperations.mirrorPoint(yPos,"x",[this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        this.points.forEach(point => {
            let newPoint = PointOperations.mirrorPoint(yPos,"x",[point.x, point.y]);
            point.x = newPoint[0];
            point.y = newPoint[1];
            let newPointExtra = PointOperations.mirrorPoint(yPos,"x",[point.extraX, point.extraY]);
            point.extraX = newPointExtra[0];
            point.extraY = newPointExtra[1];
        });
        if(this.isMask){
            this.rotation = 360-this.rotation;
        }
        this.updateProperties();
    }
    resize(scale, anchorPoint = this.center){
        let scalePoint = PointOperations.scalePoint;
        //origin
        let newOrigin = scalePoint([this.xOrigin, this.yOrigin], anchorPoint, scale);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        for(let index in this.points){
            //points itself
            let point = this.points[index];
            let newPoint = scalePoint([point.x, point.y], anchorPoint, scale);
            point.x = newPoint[0];
            point.y = newPoint[1];
            //point extra
            let newPointExtra = scalePoint([point.extraX, point.extraY], anchorPoint, scale);
            point.extraX = newPointExtra[0];
            point.extraY = newPointExtra[1];
        }
    }
    icon(){
        return `
            <path
            d="M 1 1 L 4 2 L 7 1 L 6 4 L 7 7 L 4 6 L 1 7 L 2 4 Z"
            fill="${this.color}"
            ${(this.borderWidth > 0)?`stroke-width=1 stroke="${this.borderColor}"`:""}
            />
        `;
    }
    //@Override
    additionalOptions(x, y, repaint){
        let options =  [
            {
                label:"add",
                icon:"img/add_plus.svg",
                clickHandler:()=>{
                    this.addPoint(x, y);
                    this.matchCenters();
                    this.updateProperties();
                    repaint();
                },
                type:"custom"
            }
        ]
        if(this.getPointsByDistance(x, y).distance[0] <= this.allowManuelPointEditDistance){//if click close to marker
            options.push({
                    label:"remove",
                    icon:"img/remove_minus.svg",
                    clickHandler:()=>{
                        this.removePoint(x, y);
                        this.matchCenters();
                        this.updateProperties();
                        repaint();},
                    type:"custom"
                },{
                    label:"arc",
                    icon:"img/remove_minus.svg",
                    clickHandler:()=>{
                        let point = this.getPoint(this.getPointsByDistance(x, y).index[0]);
                        point.method = "A";
                        this.fixSurroundingPoints(this.points, this.getPointsByDistance(x, y).index[0]);
                        repaint();
                    },
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
        //set next point to method "L" and set the extra points
        let lastPoint = this.getPoint(originalPosPointA[0]);
        let extraPos = PointOperations.halfwayVector([newPointPos[0], newPointPos[1]],[lastPoint.x, lastPoint.y]);
        let newPoint = {
            x:newPointPos[0],
            y:newPointPos[1],
            method:"L",
            extraX:extraPos[0],
            extraY:extraPos[1],
            type:"round"
        }
        //correct next point
        let nextPoint = this.getPoint(originalPosPointA[0]+1);
        let nextExtraPos =  PointOperations.halfwayVector([newPointPos[0], newPointPos[1]],[nextPoint.x, nextPoint.y]);
        nextPoint.extraX = nextExtraPos[0];
        nextPoint.extraY = nextExtraPos[1];
        nextPoint.method = "L";
        //insert new point
        this.points.splice(originalPosPointA[0]+1, 0, newPoint);
    }
    getPointsByDistance(x, y){
        //get the closest edge
        let distances = [];
        let originalPosPoint = [];
        for(let i = 0; i < this.points.length; i++){
            let point = this.points[i];
            let realPoint = this.rotatePoint([point.x, point.y]);
            let realExtra = this.rotatePoint([point.extraX, point.extraY]);
            let distance = Math.min(
                PointOperations.vectorLength([realPoint[0] - x, realPoint[1] - y]),
                PointOperations.vectorLength([realExtra[0] - x, realExtra[1] - y])
            );
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
    /**
     * Limits the extra point coordinated of a point to the allowed values for a arc point
     * @param {*} point the next point after the one that should be limited. IMPORTANT: not an array but a point object
     * @param {*} index index of the point in points array
     * @param {*} x x coordinate that should be limited
     * @param {*} y y coordinate that should be limited
     * @returns the limited point
     */
    limitToArcPoint(point, index, x, y){
        let lastPoint = this.getPoint(index - 1);
        if(lastPoint.x === point.x && lastPoint.y === point.y){//cannot calc curve with identical points
            return [x, y];
        }
        let middlePoint = PointOperations.halfwayVector([lastPoint.x, lastPoint.y],[point.x, point.y]);
        let distance = PointOperations.lineDistance(x, y, lastPoint.x, lastPoint.y, point.x, point.y);
        let distBetweenPoints = PointOperations.distance(lastPoint.x,lastPoint.y,point.x,point.y);
        let minRadius = distBetweenPoints/2;
        (distance < minRadius)?distance = distance:distance = minRadius;//limit distance to min radius
        let orthVector = PointOperations.orthogonalVector([point.x - lastPoint.x, point.y - lastPoint.y]);
        orthVector = PointOperations.chooseVectorDirection(middlePoint, orthVector, [x, y]);
        //add more distance when smotthing kicks in to have the marker still on the line
        let effectiveDist = distance;
        if(point.type = "round"){
            if((distance/distBetweenPoints) > this.allowArcRoundingRatio){
                effectiveDist += this.arcSmoothingDistance;
            }
        }
        orthVector = PointOperations.trimVectorLength(orthVector, UniversalOps.snap(effectiveDist, this.arcSmoothingDistance, [minRadius+this.arcSmoothingDistance]));
        return [middlePoint[0] + orthVector[0], middlePoint[1] + orthVector[1]];
    }
    //Override
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        let points = this.copy(this.points);
        let neutralizeRotation = (point)=>{return PointOperations.rotateAroundPoint(this.center, point, -this.rotation)};
        let pointRotatedToNeutral = neutralizeRotation([marker.x, marker.y]);
        if(marker.memorize == "rotate"){
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: parseInt(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        }else if(marker.memorize === "resize"){
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance/oldDistance);
            changes = {
                xOrigin:this.xOrigin,
                yOrigin:this.yOrigin,
                points:this.points
            };
        }else if(marker.memorize === points.length - 1){//if the last point is moved that is equal to origin
            points[marker.memorize].x = pointRotatedToNeutral[0];
            points[marker.memorize].y = pointRotatedToNeutral[1];
            this.fixSurroundingPoints(points, marker.memorize);
            //move last point and Origin
            changes = {
                xOrigin: pointRotatedToNeutral[0],
                yOrigin: pointRotatedToNeutral[1],
                points: points
            }
        }else if(String(marker.memorize).substr(0,5) === "extra"){
            let index = marker.memorize.substr(5);
            let point = points[index];
            //set to curve if moved directly
            if(point.method == "L"){
                point.method = "Q";
            }
            if(point.method == "A"){//arc point
                let pointRotatedToNeutralPrecise = PointOperations.rotateAroundPoint(this.center, [xPrecise, yPrecise], -this.rotation);
                let limitedPoint = this.limitToArcPoint(point, index, ...pointRotatedToNeutralPrecise );
                point.extraX = limitedPoint[0];
                point.extraY = limitedPoint[1];
            }else{
                point.extraX = pointRotatedToNeutral[0];
                point.extraY = pointRotatedToNeutral[1];
            }
            changes = {points:points};
        }else if(marker.memorize != "rotate"){//normal marker
            points[marker.memorize].x = pointRotatedToNeutral[0];
            points[marker.memorize].y = pointRotatedToNeutral[1];
            this.fixSurroundingPoints(points, marker.memorize);
            changes = {points:points};
        }
        return changes;
    }
    fixSurroundingPoints(points, index){
        index = parseInt(index);
        //adjust based on last point
        let lastIndex = (index == 0)?points.length - 1:index - 1;//last point is before first point
        let point = points[index];
        let pointExtraPos, nextPoint;
        if(index == points.length - 1){
            pointExtraPos =  PointOperations.halfwayVector([ points[points.length - 2].x,  points[points.length - 2].y],[point.x, point.y]);
            nextPoint = points[0];
        }else{
            pointExtraPos =  PointOperations.halfwayVector([ points[lastIndex].x,  points[lastIndex].y],[point.x, point.y]);
            nextPoint = points[index+1];
        }
        //correct last point
        if(point.method == "L"){
            point.extraX = pointExtraPos[0];
            point.extraY = pointExtraPos[1];
        }else if(points[index].method == "A"){
            let limitedPoint = this.limitToArcPoint(point,index, point.extraX, point.extraY);
            point.extraX = limitedPoint[0];
            point.extraY = limitedPoint[1];
        }
        //correct next point
        if(nextPoint.method == "L"){
            let nextExtraPos =  PointOperations.halfwayVector([ points[index].x,  points[index].y],[nextPoint.x, nextPoint.y]);
            nextPoint.extraX = nextExtraPos[0];
            nextPoint.extraY = nextExtraPos[1];
        }else if(nextPoint.method == "A"){
            let limitedPoint = this.limitToArcPoint(nextPoint, index + 1, nextPoint.extraX, nextPoint.extraY);
            nextPoint.extraX = limitedPoint[0];
            nextPoint.extraY = limitedPoint[1];
        }
        return points;
    }
    startActiveDraw(x, y){
        return {
            xOrigin:x,
            yOrigin:y,
            points:[{x:x,y:y,method:"L",type:"round"}]
        }
    }
    movedActiveDraw(x, y){
        let newPoints = this.copy(this.points);
        //last point has always to exist, as origin is not painted directly
        newPoints.pop();
        newPoints.pop();
        let mid;
        if(this.points.length > 1){
            let point = this.getPoint(this.points.length - 3);//3 because: 1 dummy + 1 identical to self + 1 last point
            mid = PointOperations.halfwayVector([point.x,point.y],[x,y]);
        }else{
            mid = PointOperations.halfwayVector([this.xOrigin,this.yOrigin],[x,y]);
        }
        newPoints.push({x:x,y:y,method:"L",type:"sharp",extraX:mid[0],extraY:mid[1]});
        newPoints.push({method:"L",x:this.xOrigin,y:this.yOrigin,extraX:0,extraY:0,type:"round"});   
        return {
            points:newPoints
        }
    }
    releaseActiveDraw(x, y){
        //if clicked on finish marker
        if(PointOperations.distance(this.xOrigin, this.yOrigin, x, y) < this.cancelActiveDrawDistance){
            this.points.pop();
            this.points.pop();
            let mid = PointOperations.halfwayVector([this.points[this.points.length - 1].x,this.points[this.points.length - 1].y],[x,y]);
            this.points.push({x:this.xOrigin,y:this.yOrigin,method:"L",extraX:mid[0],extraY:mid[1],type:"round"});
            return undefined;
        }else{//insert new point
            let newPoints = this.copy(this.points);
            let mid = PointOperations.halfwayVector([this.getPoint(this.points.length - 3).x,this.getPoint(this.points.length - 3).y],[x,y]);//3 because: 1 dummy + 1 identical to self + 1 last point
            let insertPoint = {x:x,y:y,method:"L",type:"round",extraX:mid[0],extraY:mid[1]};
            newPoints.splice(newPoints.length - 1, 0, insertPoint);
            newPoints[newPoints.length - 3].type = "round";//change from sharp to round after placement
            return {
                points:newPoints
            }
        }
    }
    activeDrawMarkers(){
        return [[this.xOrigin, this.yOrigin, undefined,"check"]];
    }
    //@Override
    markerClicked(marker){
        if(marker.memorize != undefined){
            let splitMemo = [String(marker.memorize).substring(0, 5), String(marker.memorize).substring(5)];
            if(splitMemo[0] == "extra"){//curve point
                let index = parseInt(splitMemo[1]);
                if(this.points[index].method === "Q" || this.points[index].method === "A"){
                    this.points[index].method = "L";
                    this.fixSurroundingPoints(this.points, index);
                }else{
                    this.points[index].method = "Q";
                }
            }else{//edge point
                let index = parseInt(splitMemo[0]);
                if(this.points[index].type == "round"){
                    this.points[index].type = "sharp";
                }else{
                    this.points[index].type = "round";
                }
            }   
        }
    }
    /**
     * Creates the string for a arc in a path. Does not include the method "A" and the endpoint coordinates.
     * @param {*} lastPoint 
     * @param {*} nextPoint 
     * @param {*} extraPoint
     * @returns 
     */
    arcString(lastPoint, nextPoint, extraPoint){
        //does not work when all points are on one line OR endpoints are identical
        if(1 > PointOperations.lineDistance(...extraPoint,lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y) || (lastPoint.x === nextPoint.x && lastPoint.y === nextPoint.y)){
            //console.warn("Path arc needs 3 Points that are NOT on one line");
            return "error";
        }
        let paintBiggerArc = false;
        let rotation = "0";
        let pointsDistance = PointOperations.distance(lastPoint.x,lastPoint.y, nextPoint.x,nextPoint.y);
        let markerDistance = PointOperations.distance(nextPoint.extraX, nextPoint.extraY, ...PointOperations.halfwayVector([lastPoint.x, lastPoint.y],[nextPoint.x, nextPoint.y]));
        let minRadius = pointsDistance/2;
        let radius;
        if(markerDistance > minRadius){
            radius = minRadius;//limit min size to half circle
        }else{
            radius = PointOperations.circleRadius(lastPoint.x,lastPoint.y,nextPoint.x,nextPoint.y,extraPoint[0],extraPoint[1],false);
        }
        radius = PointOperations.clearInfinity(radius);
        let sideOfLine = PointOperations.sideOfLine([lastPoint.x, lastPoint.y] ,[nextPoint.x, nextPoint.y], extraPoint);
        let paintPositiveDegree = (sideOfLine == "right")?false:true;
        return `${radius} ${radius} ${rotation} ${(paintBiggerArc)?"1":"0"} ${(paintPositiveDegree)?"1":"0"} `;
    }
    /**
     * Transform the points into svg path 
     * @param {Boolean} limitPrecision should the output precision be limited. If true takes performance hit
     * @returns 
     */
    getPointsString(limitPrecision = false){
        let pointsString = new Array();
        this.points.forEach((point, index) => {
            let elementString = new String();
            //method
            elementString += point.method+" ";
            //curve point
            let gotLastPoint = this.getPoint(index-1);
            let gotNextPoint = this.getPoint(index+1);
            let allowArc = !(gotLastPoint.x === point.x && gotLastPoint.y === point.y);//only allow arc if endpoints are different
            if("Q" == point.method){
                elementString += point.extraX+" "+point.extraY+" ";
            }else if("A" == point.method){
                let arcString = this.arcString(gotLastPoint,point, [point.extraX, point.extraY]);
                if(arcString != "error"){
                    elementString += arcString;
                }else{
                    elementString = elementString.slice(0, elementString.length-2) + "L ";
                }
            }
            let rounderDistance = (point.rounderDistance == undefined)?this.defaultEdgeRounderDistance:point.rounderDistance;
            switch (point.type) {
                case "round":
                    //BOTH IF and ELSE have to be adjusted
                    //the main point will be replaced by two points witha curve between them
                    if(index != this.points.length - 1 && this.points.length > 1){
                        //get the last point a line was draw to before the main point
                        let lastPoint = (point.method == "L")?[gotLastPoint.x, gotLastPoint.y]:[point.extraX,point.extraY];
                        //get the next point a line will be draw to after the main point
                        let nextPoint = (this.points[index+1].method == "L")?[this.points[index+1].x, this.points[index+1].y]:[this.points[index+1].extraX,this.points[index+1].extraY];
                        //get the 2 new points to round of the single point
                        let toLastPointVector = [lastPoint[0]-point.x, lastPoint[1]-point.y];
                        let toNextPointVector = [nextPoint[0]-point.x, nextPoint[1]-point.y];
                        //limit the distance of the rounder points from the main point, so the rounder points are not place behind the last/next point
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));
                        //adjust vectors to arc
                        if(point.method == "A"){
                            let lastMainPoint = gotLastPoint;
                            let pointsDistance = PointOperations.distance(lastMainPoint.x,lastMainPoint.y, point.x,point.y);
                            let markerDistance = PointOperations.distance(point.extraX, point.extraY, ...PointOperations.halfwayVector([lastMainPoint.x, lastMainPoint.y],[point.x, point.y]));
                            //only if circle is full size start rounding
                            if((markerDistance/pointsDistance) > this.allowArcRoundingRatio && allowArc){
                                toLastPointVector = PointOperations.orthogonalVector([point.x - lastMainPoint.x,point.y - lastMainPoint.y]);//vector orth. on the line
                                //find the closer vector to extra point to get correct direction
                                toLastPointVector = PointOperations.chooseVectorDirection([lastMainPoint.x, lastMainPoint.y],toLastPointVector,[point.extraX, point.extraY]);
                                maxRoundingDistancetoLast = this.arcSmoothingDistance;
                            }else{
                                maxRoundingDistancetoLast = 0;
                            }
                        }
                        if(this.getPoint(index+1).method == "A"){//if next point is arc
                            let nextMainPoint = gotNextPoint;
                            let pointsDistance = PointOperations.distance(nextMainPoint.x,nextMainPoint.y, point.x,point.y);
                            let markerDistance = PointOperations.distance(nextMainPoint.extraX, nextMainPoint.extraY, ...PointOperations.halfwayVector([nextMainPoint.x, nextMainPoint.y],[point.x, point.y]));
                            //only if circle is full size start rounding
                            if((markerDistance/pointsDistance) > this.allowArcRoundingRatio && allowArc){
                                toNextPointVector = PointOperations.orthogonalVector([point.x - nextMainPoint.x,point.y - nextMainPoint.y]);//vector orth. on the line
                                //find the closer vector to extra point to get correct direction
                                toNextPointVector = PointOperations.chooseVectorDirection([nextMainPoint.x, nextMainPoint.y],toNextPointVector,[nextMainPoint.extraX, nextMainPoint.extraY]);
                                maxRoundingDistancetoNext = this.arcSmoothingDistance;
                            }else{
                                maxRoundingDistancetoNext = 0;
                            }
                        }
                        //set the distance of the rounder points from the main point
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x+toLastPointVector[0],point.y+toLastPointVector[1]];
                        let secondRounderPoint = [point.x+toNextPointVector[0],point.y+toNextPointVector[1]];
                        if(limitPrecision){
                            firstRounderPoint = [this.pt(firstRounderPoint[0]), this.pt(firstRounderPoint[1])];
                            secondRounderPoint = [this.pt(secondRounderPoint[0]), this.pt(secondRounderPoint[1])];
                        }
                        elementString += firstRounderPoint[0]+" "+firstRounderPoint[1]+" ";
                        elementString += "Q "+point.x+" "+point.y+" ";
                        elementString += secondRounderPoint[0]+" "+secondRounderPoint[1]+" ";
                        break;
                    }else if(index === this.points.length - 1){
                        //last point (equals the position of origin)
                        //get the last point a line was draw to before the main point
                        let lastPoint = (point.method == "L")?[gotLastPoint.x, gotLastPoint.y]:[point.extraX,point.extraY];
                        //get the next point a line will be draw to after the main point (which is the first point again)
                        let nextPoint = (this.points[0].method == "L")?[this.points[0].x, this.points[0].y]:[this.points[0].extraX,this.points[0].extraY];
                        //get the 2 new points to round of the single point
                        let toLastPointVector = [lastPoint[0]-point.x, lastPoint[1]-point.y];
                        let toNextPointVector = [nextPoint[0]-point.x, nextPoint[1]-point.y];
                        //limit the distance of the rounder points from the main point, so the rounder points are not place behind the last/next point
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));
                        //adjust vectors to arc
                        if(point.method == "A"){
                            let lastMainPoint = gotLastPoint;
                            let pointsDistance = PointOperations.distance(lastMainPoint.x,lastMainPoint.y, point.x,point.y);
                            let markerDistance = PointOperations.distance(point.extraX, point.extraY, ...PointOperations.halfwayVector([lastMainPoint.x, lastMainPoint.y],[point.x, point.y]));
                            //only if circle is full size start rounding
                            if((markerDistance/pointsDistance) > this.allowArcRoundingRatio && allowArc){
                                toLastPointVector = PointOperations.orthogonalVector([point.x - lastMainPoint.x,point.y - lastMainPoint.y]);//vector orth. on the line
                                //find the closer vector to extra point to get correct direction
                                toLastPointVector = PointOperations.chooseVectorDirection([lastMainPoint.x, lastMainPoint.y],toLastPointVector,[point.extraX, point.extraY]);
                                //limit rounding to prevent big jumps
                                maxRoundingDistancetoLast = this.arcSmoothingDistance;
                            }else{
                                maxRoundingDistancetoLast = 0;
                            }
                        }
                        if(this.points.length > 1 && this.getPoint(index+1).method == "A"){//if next point is arc
                            let nextMainPoint = gotNextPoint;
                            let pointsDistance = PointOperations.distance(nextMainPoint.x,nextMainPoint.y, point.x,point.y);
                            let markerDistance = PointOperations.distance(nextMainPoint.extraX, nextMainPoint.extraY, ...PointOperations.halfwayVector([nextMainPoint.x, nextMainPoint.y],[point.x, point.y]));
                            //only if circle is full size start rounding
                            if((markerDistance/pointsDistance) > this.allowArcRoundingRatio && allowArc){
                                toNextPointVector = PointOperations.orthogonalVector([point.x - nextMainPoint.x,point.y - nextMainPoint.y]);//vector orth. on the line
                                //find the closer vector to extra point to get correct direction
                                toNextPointVector = PointOperations.chooseVectorDirection([nextMainPoint.x, nextMainPoint.y],toNextPointVector,[nextMainPoint.extraX, nextMainPoint.extraY]);
                                //limit rounding to prevent big jumps
                                maxRoundingDistancetoNext = this.arcSmoothingDistance;
                            }else{
                                maxRoundingDistancetoNext = 0;
                            }
                        }
                        //set the distance of the rounder points from the main point
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x+toLastPointVector[0],point.y+toLastPointVector[1]];
                        let secondRounderPoint = [point.x+toNextPointVector[0],point.y+toNextPointVector[1]];
                        if(limitPrecision){
                            firstRounderPoint = [this.pt(firstRounderPoint[0]), this.pt(firstRounderPoint[1])];
                            secondRounderPoint = [this.pt(secondRounderPoint[0]), this.pt(secondRounderPoint[1])];
                        }
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
        //scale marker
        let boundingTopLeft = [this.boundingRect.x,this.boundingRect.y];
        let boundingBottomRight = [this.boundingRect.x + this.boundingRect.width, this.boundingRect.y + this.boundingRect.height];
        let scaleMarkerDistance = PointOperations.distance(...boundingTopLeft, ...boundingBottomRight)/2 + this.rotationMarkerDistanceFromPattern;
        this.scaleMarkerPosition = PointOperations.rotateAroundPoint(this.center, PointOperations.orthogonalIcon(...boundingTopLeft,...boundingBottomRight, scaleMarkerDistance , "top"), 90);
        r.push([...this.scaleMarkerPosition,"resize","arrow-resize", 0])
        for(let index in this.points){
            let point = this.points[index];
            let rotatedPoint = this.rotatePoint([point.x,point.y]);
            //normal point
            if(point.type == "round"){
                r.push([...rotatedPoint,parseInt(index),"point"]);
            }else{
                r.push([...rotatedPoint,parseInt(index),"octagon"]);
            }
            //for extra point
            let lastPoint = this.getPoint(index - 1);
            //if extra point is Quadratic
            if(point.method == "Q"){
                //add marker on the point
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                r.push([...rotatedExtraPoint,"extra"+index,"path_curve"]);
            }else if(point.method == "A"){
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                r.push([...rotatedExtraPoint,"extra"+index,"path_curve"]);
            }else{
                //if distance from last point is great enough to draw another marker
                if(PointOperations.vectorLength([point.x-lastPoint.x,point.y-lastPoint.y]) > this.displayCurveMarkersSpaceLimit){
                    let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                    r.push([rotatedExtraPoint[0],rotatedExtraPoint[1],"extra"+index,"path_straight"]);
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
            if(point.method === "Q" || point.method === "A"){
                let lastPoint = this.getPoint(index - 1);
                let rotatedLastPoint = this.rotatePoint([lastPoint.x,lastPoint.y]);
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                let rotatedPoint = this.rotatePoint([point.x,point.y]);
                //if extra point is Quadratic
                if("Q" === point.method){
                    l.push([...rotatedLastPoint, ...rotatedExtraPoint]);
                    l.push([...rotatedPoint,...rotatedExtraPoint]);
                }else if("A" === point.method){
                    l.push([...PointOperations.halfwayVector(rotatedLastPoint, rotatedPoint), ...rotatedExtraPoint]);
                }
            }
        }
        return l;
    }
    cleanHTML(limitPrecision = false){
        let defaultPattern = new Path(0,0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let pointsString = this.getPointsString(limitPrecision);
        let cleanHTML = ''
        +'<path '+ (this.maskReference())
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
        let additionalAttributes = {
            points: this.copy(this.points),
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            rotation: this.rotation,
            center: this.copy(this.center),
            boundingRect: this.copy(this.boundingRect)
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
    getClass(){
        return Path;
    }
}