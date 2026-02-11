export default class PointOperations {
    /**
     * Finds the middle value between two numbers
     * @param {number} point1 
     * @param {number} point2 
     * @returns the value half way between point 1 and 2
     */
    static halfway(point1: number = 0, point2: number = 0): number {
        return (point1 - point2) / 2 + point2;
    }
    /**
     * Finds the middle coordinate between two vectors
     * @param {[number, number]} vectorA 1 
     * @param {[number, number]} vectorB 2 
     * @returns the coordinate half way between vector A and B
     */
    static halfwayVector(vectorA: [number, number], vectorB: [number, number]): [number, number] {
        return [PointOperations.halfway(vectorA[0], vectorB[0]), PointOperations.halfway(vectorA[1], vectorB[1])];
    }
    /**
     * Finds a position in the middle of a line. Than a point is offset orthogonally and its coordinates are returned. Ideal for floating interface icons.
     * @param {number} startX starting coordinate x of line
     * @param {number} startY starting coordinate y of line
     * @param {number} endX final coordinate x of line
     * @param {number} endY final coordinate y of line
     * @param {number} offset offset orthogonally
     * @param {string} position "top","bottom","left","right" the preferred position relative to the given line
     * @returns an Array with x and y coordinates [x,y]
     */
    static orthogonalIcon(startX: number, startY: number, endX: number, endY: number, offset: number = 10, position: string = "top"): [number, number] { //Top/bottom switch occures dep. on which value is higher and thus gets used for normalization and thus orth calculation
        let center = {
            x: PointOperations.halfway(startX, endX),
            y: PointOperations.halfway(startY, endY)
        }
        let orthVector = PointOperations.preferVectorDirection(position, PointOperations.orthogonalVector([startX - endX, startY - endY]));
        let finalPos = PointOperations.trimVectorLength(orthVector, offset);
        return [center.x + finalPos[0], center.y + finalPos[1]];
    }
    /**
     * Finds a vector that is orthogonal to the given vector.
     * @param {[number, number]} vector original vector
     * @param {boolean} normalize true if output should be normalized. Default: true
     * @returns a vector orthogonal to the original vector
     */
    static orthogonalVector(vector: [number, number], normalize: boolean = true): [number, number] {
        let normVector = PointOperations.normalize(vector);
        //find index of 1
        if (normVector.indexOf(1) == -1 && normVector.indexOf(-1) == -1) {
            console.error("The following vector could not be normalized:", vector);
        }
        let oneIndex = (normVector.indexOf(1) == -1) ? normVector.indexOf(-1) : normVector.indexOf(1);
        let notOne = normVector[1 - oneIndex]; //get the index of the not 1 value, this works because all vector have length 2 and are normalized
        let orthValue = -(normVector[oneIndex]) / notOne; //solving the scalar (x1*x2 + y1*y2 = 0) f.e. (0.4*x2 + 1*1 = 0) => (x2 = -1/0.4)
        let returnVector: [number, number] = [0, 0];
        returnVector[1 - oneIndex] = orthValue;
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
     * @returns {[number, number] | false} X and Y coordinates of intersection point.
     */
    static geradeIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): [number, number] | false {
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

        return [x, y]
    }
    /**
     * Get the distance between a point and an infinite line
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} px 
     * @param {number} py 
     * @returns {number}
     */
    static geradeDistance(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        let orthV = PointOperations.orthogonalVector([x2 - x1, y2 - y1]);
        let pointLineEnd: [number, number] = [orthV[0] + px, orthV[1] + py];
        let intersect = PointOperations.geradeIntersect(x1, y1, x2, y2, px, py, ...pointLineEnd);
        if (intersect === false) return 0;
        let distance = PointOperations.distance(px, py, ...intersect)
        return distance;
    }
    /**
     * Finds the shortest distance between a line and a point
     * @param {number} pointX 
     * @param {number} pointY 
     * @param {number} lineX1 
     * @param {number} lineY1 
     * @param {number} lineX2 
     * @param {number} lineY2 
     * @returns {number}
     */
    static lineDistance(pointX: number, pointY: number, lineX1: number, lineY1: number, lineX2: number, lineY2: number): number {
        let C = lineX2 - lineX1;
        let D = lineY2 - lineY1;
        let dot = (pointX - lineX1) * C + (pointY - lineY1) * D;
        let len_sq = C * C + D * D;
        let param = -1;

        if (len_sq != 0) {
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
     * @param {number} x1 x coordinate of point 1
     * @param {number} y1 y coordinate of point 1
     * @param {number} x2 x coordinate of point 2
     * @param {number} y2 y coordinate of point 2
     * @returns the euklidian distance between point 1 and 2
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    /**
     * Rescales values of a vector to [0,1] if positive and [-1,0] if negative.
     * @param {[number, number]} vector vector to be rescaled
     * @returns {[number, number]} a new rescaled vector
     */
    static normalize(vector: [number, number]): [number, number] {
        let normVector: [number, number] = [0, 0];
        let max = PointOperations.clearInfinity(Math.max(Math.abs(vector[0]), Math.abs(vector[1])));
        normVector[0] = PointOperations.clearInfinity(vector[0]) / max;
        normVector[1] = PointOperations.clearInfinity(vector[1]) / max;
        return normVector;
    }
    /**
     * Turns a value into a high number if it is Infinity
     * @param {number} value 
     * @returns the value, converted if necessary
     */
    static clearInfinity(value: number): number {
        return Math.min(99999, Math.max(-99999, value));
    }
    /**
     * Finds the absolute length of a vector
     * @param {[number, number]} vector 
     * @returns the length of the vector as number
     */
    static vectorLength(vector: [number, number]): number {
        return PointOperations.distance(0, 0, vector[0], vector[1]);
    }
    /**
     * Chooses between a vector and its inverted version depending on the preferred direction.
     * @param {string} direction on of ["top","bottom","right","left"]
     * @param {[number, number]} vector 
     * @returns {[number, number]} the vector unaltered or inverted
     */
    static preferVectorDirection(direction: string, vector: [number, number]): [number, number] {
        let preferedVector: [number, number] = [vector[0], vector[1]];
        switch (direction) {
            case "top":
                if (vector[1] > 0) {//if y is positive => invert vector
                    preferedVector = [-vector[0], -vector[1]]
                }
                break;
            case "bottom":
                if (vector[1] < 0) {
                    preferedVector = [-vector[0], -vector[1]]
                }
                break;
            case "right":
                if (vector[0] < 0) {
                    preferedVector = [-vector[0], -vector[1]]
                }
                break;
            case "left":
                if (vector[0] > 0) {
                    preferedVector = [-vector[0], -vector[1]]
                }
                break;
        }
        return preferedVector;
    }
    /**
     * Rotate a point around another point
     * @param {[number, number]} anchorPoint the point to rotate around
     * @param {[number, number]} rotatePoint the point that should be rotated
     * @param {number} degree the degree how much should be rotated
     * @returns the rotated point as array [x,y]
     */
    static rotateAroundPoint(anchorPoint: [number, number], rotatePoint: [number, number], degree: number): [number, number] {
        let rad = degree * (Math.PI / 180);//get bogenmaß
        //move to relative [0,0]
        let xFromOrigin = rotatePoint[0] - anchorPoint[0];
        let yFromOrigin = rotatePoint[1] - anchorPoint[1];
        //rotate
        let xRotated = xFromOrigin * Math.cos(rad) - yFromOrigin * Math.sin(rad);//math magic
        let yRotated = xFromOrigin * Math.sin(rad) + yFromOrigin * Math.cos(rad);
        //add anchor point again
        return [xRotated + anchorPoint[0], yRotated + anchorPoint[1]];
    }
    static withinBounds(pointX: number, pointY: number, boxX1: number, boxY1: number, boxX2: number, boxY2: number): boolean {
        return boxX1 <= pointX && pointX <= boxX2 && boxY1 <= pointY && pointY <= boxY2;
    }
    /**
     * Only work for upright rects
     * @param {{x:number, y:number, width:number, height:number}} rect 
     * @returns {[number, number]}
     */
    static rectCenter(rect: { x: number, y: number, width: number, height: number }): [number, number] {
        return [rect.x + rect.width / 2, rect.y + rect.height / 2];
    }
    static angle(vector: [number, number]): number {
        let bog = Math.atan(vector[0] / -vector[1]);//bogenmaß
        let angle = bog * (180 / Math.PI);
        //the angle is in [-90,90], needs to be converted to [0,360] using vector direction
        if (vector[0] >= 0 && vector[1] < 0) {//top right
            return angle;
        } else if (vector[0] > 0 && vector[1] >= 0) {//bottom right
            return (180 + angle);//angle is negative
        } else if (vector[0] <= 0 && vector[1] >= 0) {//bottom left
            return (180 + angle);
        } else {//top left
            return (360 + angle);//angle is negative
        }
    }
    /** 
     * Umrechnung eines Winkels [DEG] in den Bogenmaß [RAD]
     */
    static radians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
    /**
     * Resize a vector to a specific length. If the vector has length 0, [0,0] is returned.
     * @param {[number, number]} vector the vector to resize
     * @param {number} targetLength the target length
     * @returns {[number, number]} the resized vector
     */
    static trimVectorLength(vector: [number, number], targetLength: number = 1): [number, number] {
        let vectorLength = PointOperations.vectorLength(vector);
        if (vectorLength === 0) {
            return [0, 0];
        } else {
            let targetRatio = targetLength / vectorLength;
            return [targetRatio * vector[0], targetRatio * vector[1]]
        }
    }
    /**
     * Mirrors a point along a line parallel to x or y axis
     * @param {number} axisValue the position of 
     * @param {string} axisDirection "x" or "y" for x or y axis direction
     * @param {[number, number]} point the point that should be mirrored
     * @returns {[number, number]} the mirrored point
     */
    static mirrorPoint(axisValue: number, axisDirection: string, point: [number, number]): [number, number] {
        if (axisDirection == "x") {
            return [point[0], (point[1] + (axisValue - point[1]) * 2)];
        } else {
            return [(point[0] + (axisValue - point[0]) * 2), point[1]];
        }
    }
    /**
     * Determinds on which side of a line a point is. So input order matters for pointA ans pointB.
     * @param {[number, number]} pointA 
     * @param {[number, number]} pointB 
     * @param {[number, number]} sidePoint 
     * @returns {"left" | "right"}
     */
    static sideOfLine(pointA: [number, number], pointB: [number, number], sidePoint: [number, number]): "left" | "right" {
        let vector = [pointB[0] - pointA[0], pointB[1] - pointA[1]];
        //g2*(p1-s1)+g1*(p2-s2)
        let indicator = vector[1] * (sidePoint[0] - pointA[0]) - vector[0] * (sidePoint[1] - pointA[1]);
        return (indicator < 0) ? "right" : "left";
    }
    static chooseVectorDirection(vectorPosition: [number, number], vector: [number, number], targetPoint: [number, number]): [number, number] {
        let distance = PointOperations.distance(vectorPosition[0] + vector[0], vectorPosition[1] + vector[1], targetPoint[0], targetPoint[1]);
        let invertedDist = PointOperations.distance(vectorPosition[0] - vector[0], vectorPosition[1] - vector[1], targetPoint[0], targetPoint[1]);
        if (distance < invertedDist) {
            return vector;
        } else {
            return [-vector[0], -vector[1]];
        }
    }
    /**
     * Finds a circle radius from 3 Points. Credit: geeksforgeeks.org
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} x3 
     * @param {number} y3 
     */
    static circleRadius(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, parseToInt = true): number {
        var x12 = (x1 - x2);
        var x13 = (x1 - x3);

        var y12 = (y1 - y2);
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
        return (parseToInt) ? Math.trunc(r) : r;
    }
    /**
     * Scales a point's distance to a center. 
     * @param {[number, number]} point The point that should be scaled
     * @param {[number, number]} center The center to which the distance will be scaled
     * @param {number} scale The value by which the scale should be multiplied
     * @returns {[number, number]} the scaled point
     */
    static scalePoint(point: [number, number], center: [number, number], scale: number): [number, number] {
        let distToCenter = PointOperations.distance(point[0], point[1], center[0], center[1]);
        let targetLength = distToCenter * scale;
        let centerToPointVector: [number, number] = [point[0] - center[0], point[1] - center[1]];
        let newVectorFromCenter = PointOperations.trimVectorLength(centerToPointVector, targetLength);
        return [center[0] + newVectorFromCenter[0], center[1] + newVectorFromCenter[1]];
    }
}