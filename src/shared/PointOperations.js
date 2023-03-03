export default class PointOperations{
    /**
     * Finds the middle value between two numbers
     * @param {Number} point1 
     * @param {Number} point2 
     * @returns the value half way between point 1 and 2
     */
    static halfway(point1 = 0, point2 = 0){
        return (point1 - point2) / 2 + point2;
    }
    /**
     * Finds the middle coordinate between two vectors
     * @param {Array} vectorA 1 
     * @param {Array} vectorB 2 
     * @returns the coordinate half way between vector A and B
     */
     static halfwayVector(vectorA, vectorB){
        return [PointOperations.halfway(vectorA[0],vectorB[0]),PointOperations.halfway(vectorA[1],vectorB[1])];
    }
    /**
     * Finds a position in the middle of a line. Than a point is offset orthogonally and its coordinates are returned. Ideal for floating interface icons.
     * @param {Number} startX starting coordinate x of line
     * @param {Number} startY starting coordinate y of line
     * @param {Number} endX final coordinate x of line
     * @param {Number} endY final coordinate y of line
     * @param {Number} offset offset orthogonally
     * @param {String} position "top","bottom","left","right" the preferred position relative to the given line
     * @returns an Array with x and y coordinates [x,y]
     */
    static orthogonalIcon(startX,startY,endX,endY,offset = 10,position = "top"){//Top/bottom switch occures dep. on which value is higher and thus gets used for normalization and thus orth calculation
        let center = {
            x:PointOperations.halfway(startX, endX),
            y:PointOperations.halfway(startY, endY)
        }
        let orthVector = PointOperations.preferVectorDirection(position, PointOperations.orthogonalVector([startX-endX,startY-endY]));
        let finalPos = PointOperations.trimVectorLength(orthVector,offset);
        return [center.x + finalPos[0], center.y + finalPos[1]];
    }
    /**
     * Finds a vector that is orthogonal to the given vector.
     * @param {Array} vector original vector
     * @param {boolean} normalize true if output should be normalized. Default: true
     * @returns a vector orthogonal to the original vector
     */
    static orthogonalVector(vector, normalize = true){
        let normVector = PointOperations.normalize(vector);
        //find index of 1
        if(normVector.indexOf(1) == -1 && normVector.indexOf(-1) == -1){
            console.error("The following vector could not be normalized:",vector);
        }
        let oneIndex = (normVector.indexOf(1) == -1)?normVector.indexOf(-1):normVector.indexOf(1);
        let notOne = normVector[1-oneIndex];//get the index of the not 1 value, this works because all vector have length 2 and are normalized
        let orthValue = -(normVector[oneIndex])/notOne;//solving the scalar (x1*x2 + y1*y2 = 0) f.e. (0.4*x2 + 1*1 = 0) => (x2 = -1/0.4)
        let returnVector = [];
        returnVector[1-oneIndex] = orthValue;
        returnVector[oneIndex] = 1;
        return PointOperations.normalize(returnVector);
    }
    /**
     * Finds intersection point between two lines
     *  @param {number} x1 - point x coordinate line 1 x1
     *  @param {number} y1 - point y coordinate line 1 y1
     *  @param {number} x2 - point x coordinate line 1 x2
     *  @param {number} y2 - point y coordinate line 1 y2
     *  @param {number} x3 - point x coordinate line 2 x1
     *  @param {number} y3 - point y coordinate line 2 y1
     *  @param {number} x4 - point x coordinate line 2 x2
     *  @param {number} y4 - point y coordinate line 2 y2
     * @returns {{x:Number,y:Number}} X and Y coordinates of intersection point.
     */
    static geradeIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false
        }
        const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        // Lines are parallel
        if (denominator === 0) {
            return false
        }
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1)
        let y = y1 + ua * (y2 - y1)

        return [ x, y ]
    }
    /**
     * Get the distance between a point and an infinite line
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} x2 
     * @param {*} y2 
     * @param {*} px 
     * @param {*} py 
     * @returns 
     */
    static geradeDistance(x1, y1, x2, y2, px, py){
        let orthV = PointOperations.orthogonalVector([x2 - x1, y2 -y1]);
        let pointLineEnd = [orthV[0] + px, orthV[1] + py];
        let intersect = PointOperations.geradeIntersect(x1, y1, x2, y2, px, py, ...pointLineEnd);
        let distance = PointOperations.distance(px, py, ...intersect)
        return distance;
    }
    /**
     * Finds the shortest distance between a line and a point
     * @param {*} pointX 
     * @param {*} pointY 
     * @param {*} lineX1 
     * @param {*} lineY1 
     * @param {*} lineX2 
     * @param {*} lineY2 
     * @returns 
     */
    static lineDistance(pointX, pointY, lineX1, lineY1, lineX2, lineY2) {
        let C = lineX2 - lineX1;
        let D = lineY2 - lineY1;
        let dot = (pointX - lineX1) * C + (pointY - lineY1) * D;
        let len_sq = C * C + D * D; 
        let param = -1;

        if (len_sq != 0){
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineX1;
            yy = lineY1;
        }
        else if (param > 1) {
            xx = lineX2;
            yy = lineY2;
        }
        else {
            xx = lineX1 + param * C;
            yy = lineY1 + param * D;
        }
        
        let dx = pointX - xx;
        let dy = pointY - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Find the euklidian distance between to points
     * @param {Number} x1 x coordinate of point 1
     * @param {Number} y1 y coordinate of point 1
     * @param {Number} x2 x coordinate of point 2
     * @param {Number} y2 y coordinate of point 2
     * @returns the euklidian distance between point 1 and 2
     */
    static distance(x1,y1,x2,y2){
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2,2));
    }
    /**
     * Rescales values of a vector to [0,1] if positive and [-1,0] if negative.
     * @param {Array} vector vector to be rescaled
     * @returns a new rescaled vector
     */
    static normalize(vector){
        let normVector = [];
        let max = PointOperations.clearInfinity(Math.max(Math.abs(vector[0]),Math.abs(vector[1])));
        normVector[0] = PointOperations.clearInfinity(vector[0])/max;
        normVector[1] = PointOperations.clearInfinity(vector[1])/max;
        return normVector;
    }
    /**
     * Turns a value into a high number if it is Infinity
     * @param {Number} value 
     * @returns the value, converted if necessary
     */
    static clearInfinity(value){
        return Math.min(99999,Math.max(-99999, value));
    }
    /**
     * Finds the absolute length of a vector
     * @param {Array} vector 
     * @returns the length of the vector as number
     */
    static vectorLength(vector){
        return PointOperations.distance(0,0,vector[0],vector[1]);
    }
    /**
     * Chooses between a vector and its inverted version depending on the preferred direction.
     * @param {String} direction on of ["top","bottom","right","left"]
     * @param {Vector} vector 
     * @returns the vector unaltered or inverted
     */
    static preferVectorDirection(direction, vector){
        let preferedVector = [vector[0],vector[1]];
        switch (direction) {
            case "top":
                if(vector[1] > 0){//if y is positive => invert vector
                    preferedVector = [-vector[0],-vector[1]]
                }
                break;
            case "bottom":
                if(vector[1] < 0){
                    preferedVector = [-vector[0],-vector[1]]
                }
                break;
            case "right":
                if(vector[0] < 0){
                    preferedVector = [-vector[0],-vector[1]]
                }
                break;
            case "left":
                if(vector[0] > 0){
                    preferedVector = [-vector[0],-vector[1]]
                }
                break;
        }
        return preferedVector;
    }
    /**
     * Rotate a point around another point
     * @param {*} anchorPoint the point to rotate around
     * @param {*} rotatePoint the point that should be rotated
     * @param {*} degree the degree how much should be rotated
     * @returns the rotated point as array [x,y]
     */
    static rotateAroundPoint(anchorPoint,rotatePoint,degree){
        let rad = degree * (Math.PI / 180);//get bogenmaß
        //move to relative [0,0]
        let xFromOrigin = rotatePoint[0] - anchorPoint[0];
        let yFromOrigin = rotatePoint[1] - anchorPoint[1];
        //rotate
        let xRotated = xFromOrigin*Math.cos(rad) - yFromOrigin*Math.sin(rad);//math magic
        let yRotated = xFromOrigin*Math.sin(rad) + yFromOrigin*Math.cos(rad);
        //add anchor point again
        return [xRotated + anchorPoint[0],yRotated + anchorPoint[1]];
    }
    static withinBounds(pointX,pointY,boxX1,boxY1,boxX2,boxY2){
        return boxX1 <= pointX && pointX <= boxX2 && boxY1 <= pointY && pointY <= boxY2;
    }
    /**
     * Only work for upright rects
     * @param {*} rect 
     * @returns 
     */
    static rectCenter(rect){
        return [rect.x+rect.width/2,rect.y+rect.height/2];
    }
    static angle(vector){
        let bog = Math.atan(vector[0]/-vector[1]);//bogenmaß
        let angle = bog*(180/Math.PI);
        //the angle is in [-90,90], needs to be converted to [0,360] using vector direction
        if(vector[0] >= 0 && vector[1] < 0){//top right
            return angle;
        }else if(vector[0] > 0 && vector[1] >= 0){//bottom right
            return (180+angle);//angle is negative
        }else if(vector[0] <= 0 && vector[1] >= 0){//bottom left
            return (180+angle);
        }else{//top left
            return (360+angle);//angle is negative
        }
    }
    /** 
     * Umrechnung eines Winkels [DEG] in den Bogenmaß [RAD]
     */
    static radians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Resize a vector to a specific length. If the vector has length 0, [0,0] is returned.
     * @param {*} vector the vector to resize
     * @param {*} targetLength the target length
     * @returns the resized vector
     */
    static trimVectorLength(vector, targetLength = 1){
        let vectorLength = PointOperations.vectorLength(vector);
        if(vectorLength === 0){
            return [0,0];
        }else{
            let targetRatio = targetLength/vectorLength;
            return [targetRatio*vector[0],targetRatio*vector[1]]
        }
    }
    /**
     * Mirrors a point along a line parallel to x or y axis
     * @param {Number} axisValue the position of 
     * @param {String} axisDirection "x" or "y" for x or y axis direction
     * @param {Array} point the point that should be mirrored
     * @returns the mirrored point
     */
    static mirrorPoint(axisValue, axisDirection, point){
        if(axisDirection == "x"){
            return [point[0],(point[1]+(axisValue - point[1])*2)];
        }else{
            return [(point[0]+(axisValue - point[0])*2),point[1]];
        }
    }
    /**
     * Determinds on which side of a line a point is. So input order matters for pointA ans pointB.
     * @param {*} pointA 
     * @param {*} pointB 
     * @param {*} sidePoint 
     * @returns "left" or "right"
     */
    static sideOfLine(pointA, pointB, sidePoint){
        let vector = [pointB[0] - pointA[0], pointB[1] - pointA[1]];
        //g2*(p1-s1)+g1*(p2-s2)
        let indicator = vector[1] * (sidePoint[0] - pointA[0]) - vector[0] * (sidePoint[1] - pointA[1]);
        return (indicator < 0)?"right":"left";
    }
    static chooseVectorDirection(vectorPosition, vector, targetPoint){
        let distance = PointOperations.distance(vectorPosition[0] + vector[0],vectorPosition[1] + vector[1], targetPoint[0], targetPoint[1]);
        let invertedDist = PointOperations.distance(vectorPosition[0] - vector[0],vectorPosition[1] - vector[1], targetPoint[0], targetPoint[1]);
        if(distance < invertedDist){
            return vector;
        }else{
            return [-vector[0],-vector[1]];
        }
    }
    /**
     * Finds a circle radius from 3 Points. Credit: geeksforgeeks.org
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} x2 
     * @param {*} y2 
     * @param {*} x3 
     * @param {*} y3 
     */
    static circleRadius(x1,  y1,  x2,  y2, x3, y3, parseToInt = true){
        var x12 = (x1 - x2);
        var x13 = (x1 - x3);
    
        var y12 =( y1 - y2);
        var y13 = (y1 - y3);
    
        var y31 = (y3 - y1);
        var y21 = (y2 - y1);
    
        var x31 = (x3 - x1);
        var x21 = (x2 - x1);
        var sx13 = Math.pow(x1, 2) - Math.pow(x3, 2);
        var sy13 = Math.pow(y1, 2) - Math.pow(y3, 2);
    
        var sx21 = Math.pow(x2, 2) - Math.pow(x1, 2);
        var sy21 = Math.pow(y2, 2) - Math.pow(y1, 2);
    
        var f = ((sx13) * (x12)
                + (sy13) * (x12)
                + (sx21) * (x13)
                + (sy21) * (x13))
                / (2 * ((y31) * (x12) - (y21) * (x13)));
        var g = ((sx13) * (y12)
                + (sy13) * (y12)
                + (sx21) * (y13)
                + (sy21) * (y13))
                / (2 * ((x31) * (y12) - (x21) * (y13)));
    
        var c = -(Math.pow(x1, 2)) -
        Math.pow(y1, 2) - 2 * g * x1 - 2 * f * y1;
        var h = -g;
        var k = -f;
        var sqr_of_r = h * h + k * k - c;
        var r = Math.sqrt(sqr_of_r);
        return (parseToInt)?parseInt(r):r;
    }
    /**
     * Scales a point's distance to a center. 
     * @param {Array} point The point that should be scaled
     * @param {Array} center The center to which the distance will be scaled
     * @param {Number} scale The value by which the scale should be multiplied
     * @returns the scaled point
     */
    static scalePoint(point, center, scale){
        let distToCenter = PointOperations.distance(point[0], point[1], center[0], center[1]);
        let targetLength = distToCenter*scale;
        let centerToPointVector = [point[0] - center[0], point[1] - center[1]];
        let newVectorFromCenter = PointOperations.trimVectorLength(centerToPointVector, targetLength);
        return [center[0] + newVectorFromCenter[0], center[1] + newVectorFromCenter[1]];
    }
}