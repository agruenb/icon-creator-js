class PointOperations{
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
}