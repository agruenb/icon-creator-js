import Pattern from "./Pattern";
import UniversalOps from "../shared/UniversalOps";
import PointOperations from "../shared/PointOperations";
import Marker from "../helperPatterns/Marker";
import PatternRegistry from "../shared/PatternRegistry";

export interface PathPoint {
    x: number;
    y: number;
    method: "M" | "L" | "Q" | "A";
    type?: "round" | "sharp";
    extraX?: number;
    extraY?: number;
    rounderDistance?: number;
}

/**
 * A complex path pattern made of multiple points, supporting lines, curves, and arcs.
 */
export default class Path extends Pattern {
    displayCurveMarkersSpaceLimit: number = 40;
    allowManuelPointEditDistance: number = 20;
    defaultEdgeRounderDistance: number = 15;
    cancelActiveDrawDistance: number = 20;
    allowArcRoundingRatio: number = 0.45;
    arcSmoothingDistance: number = 5;

    rotation: number = 0;
    center: [number, number] = [0, 0];
    allowMask: boolean = true;
    boundingRect: { x: number; y: number; width: number; height: number } = {
        x: 0,
        y: 0,
        width: 1,
        height: 1
    };

    points: PathPoint[];
    color: string;
    borderWidth: number;
    borderColor: string;

    protected scaleMarkerPosition: [number, number] = [0, 0];

    constructor(
        x: number,
        y: number,
        points: PathPoint[] = [
            { x: 100, y: 100, method: "L", type: "round", extraX: 50, extraY: 50 },
            { x: 0, y: 100, method: "L", type: "round", extraX: 50, extraY: 100 },
            { x: 0, y: 0, method: "L", type: "round", extraX: 0, extraY: 50 }
        ],
        color: string = "#000000",
        borderWidth: number = 0,
        borderColor: string = "#000000"
    ) {
        super(x, y);
        this.points = points;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        //static
        this.displayName = "Custom Shape";
        this.updateProperties();
    }

    translateTo(newOriginX: number, newOriginY: number): void {
        this.translateMaskTo(newOriginX, newOriginY);
        for (let i in this.points) {
            let point = this.points[i];
            if (point.extraX !== undefined) point.extraX = (point.extraX - this.xOrigin) + newOriginX;
            if (point.extraY !== undefined) point.extraY = (point.extraY - this.yOrigin) + newOriginY;
            point.x = (point.x - this.xOrigin) + newOriginX;
            point.y = (point.y - this.yOrigin) + newOriginY;
        }
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.updateProperties();
    }

    getPoint(index: number): PathPoint | any {
        if (index < this.points.length && index >= 0) {
            return this.points[index];
        } else if (index === -1) {
            return { x: this.xOrigin, y: this.yOrigin };
        } else if (index === this.points.length) {
            return this.points[0];
        }
        console.trace();
        console.error("Tried to access non-existent point " + index + " in path");
        return undefined;
    }

    afterAlteration(): void {
        this.matchCenters();
    }

    updateProperties(): void {
        this.boundingRect = this.getBoundingRect();
        this.center = this.getCenterUntransformed();
    }

    getBoundingRect(): { x: number; y: number; width: number; height: number } {
        if (this.points.length !== 0) {
            try {
                let top = this.points[0].y;
                let bottom = this.points[0].y;
                let left = this.points[0].x;
                let right = this.points[0].x;
                for (let i in this.points) {
                    if (this.points[i].y < top) top = this.points[i].y;
                    if (this.points[i].y > bottom) bottom = this.points[i].y;
                    if (this.points[i].x < left) left = this.points[i].x;
                    if (this.points[i].x > right) right = this.points[i].x;
                }
                return {
                    x: left,
                    y: top,
                    height: bottom - top,
                    width: right - left
                }
            } catch (e) {
                console.log("Error in this path with getting bounding rect:", this);
                return this.boundingRect;
            }
        } else {
            return this.boundingRect;
        }
    }

    getCenterProjection(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, this.getCenterUntransformed(), this.rotation);
    }

    matchCenters(): void {
        if (this.rotation !== 0) {
            let realCenter = this.getCenterUntransformed();
            let projectionCenter = this.getCenterProjection();
            let difference = [projectionCenter[0] - realCenter[0], projectionCenter[1] - realCenter[1]];
            this.translateTo(this.xOrigin + difference[0], this.yOrigin + difference[1]);
        }
    }

    getCenterUntransformed(): [number, number] {
        return PointOperations.rectCenter(this.getBoundingRect());
    }

    mirrorVertically(xPos: number = this.center[0]): void {
        super.mirrorVertically(xPos);
        let newOrigin = PointOperations.mirrorPoint(xPos, "y", [this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        this.points.forEach(point => {
            let newPoint = PointOperations.mirrorPoint(xPos, "y", [point.x, point.y]);
            point.x = newPoint[0];
            point.y = newPoint[1];
            if (point.extraX !== undefined && point.extraY !== undefined) {
                let newPointExtra = PointOperations.mirrorPoint(xPos, "y", [point.extraX, point.extraY]);
                point.extraX = newPointExtra[0];
                point.extraY = newPointExtra[1];
            }
        });
        if (this.isMask) {
            this.rotation = 360 - this.rotation;
        }
        this.updateProperties();
    }

    mirrorHorizontally(yPos: number = this.center[1]): void {
        super.mirrorHorizontally(yPos);
        let newOrigin = PointOperations.mirrorPoint(yPos, "x", [this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        this.points.forEach(point => {
            let newPoint = PointOperations.mirrorPoint(yPos, "x", [point.x, point.y]);
            point.x = newPoint[0];
            point.y = newPoint[1];
            if (point.extraX !== undefined && point.extraY !== undefined) {
                let newPointExtra = PointOperations.mirrorPoint(yPos, "x", [point.extraX, point.extraY]);
                point.extraX = newPointExtra[0];
                point.extraY = newPointExtra[1];
            }
        });
        if (this.isMask) {
            this.rotation = 360 - this.rotation;
        }
        this.updateProperties();
    }

    resize(scale: number, anchorPoint: [number, number] = this.center): void {
        let scalePoint = PointOperations.scalePoint;
        let newOrigin = scalePoint([this.xOrigin, this.yOrigin], anchorPoint, scale);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        for (let index in this.points) {
            let point = this.points[index];
            let newPoint = scalePoint([point.x, point.y], anchorPoint, scale);
            point.x = newPoint[0];
            point.y = newPoint[1];
            if (point.extraX !== undefined && point.extraY !== undefined) {
                let newPointExtra = scalePoint([point.extraX, point.extraY], anchorPoint, scale);
                point.extraX = newPointExtra[0];
                point.extraY = newPointExtra[1];
            }
        }
    }

    icon(): string {
        return `
            <path
            d="M 1 1 L 4 2 L 7 1 L 6 4 L 7 7 L 4 6 L 1 7 L 2 4 Z"
            fill="${this.color}"
            ${(this.borderWidth > 0) ? `stroke-width=1 stroke="${this.borderColor}"` : ""}
            />
        `;
    }

    additionalOptions(x: number, y: number, repaint: () => void): any[] {
        let options: any[] = [
            {
                label: "add",
                icon: "img/add_plus.svg",
                clickHandler: () => {
                    this.addPoint(x, y);
                    this.matchCenters();
                    this.updateProperties();
                    repaint();
                },
                type: "custom"
            }
        ]
        const byDistance = this.getPointsByDistance(x, y);
        if (byDistance.distance[0] <= this.allowManuelPointEditDistance) {
            options.push({
                label: "remove",
                icon: "img/remove_minus.svg",
                clickHandler: () => {
                    this.removePoint(x, y);
                    this.matchCenters();
                    this.updateProperties();
                    repaint();
                },
                type: "custom"
            }, {
                label: "arc",
                icon: "img/remove_minus.svg",
                clickHandler: () => {
                    let point = this.getPoint(byDistance.index[0]);
                    point.method = "A";
                    this.fixSurroundingPoints(this.points, byDistance.index[0]);
                    repaint();
                },
                type: "custom"
            })
        }
        return options;
    }

    addPoint(x: number, y: number): void {
        let distances: number[] = [];
        let originalPosPointA: number[] = [];
        for (let i = 0; i < this.points.length; i++) {
            let pointA = this.getPoint(i - 1);
            let pointB = this.points[i];
            let distance = PointOperations.lineDistance(x, y, ...this.rotatePoint([pointA.x, pointA.y]), ...this.rotatePoint([pointB.x, pointB.y]));
            let index = 0;
            while (distances[index] != undefined && distances[index] < distance) {
                index++;
            }
            distances.splice(index, 0, distance);
            originalPosPointA.splice(index, 0, i - 1);
        }
        let newPointPos = this.rotatePoint([x, y], true);
        let lastPoint = this.getPoint(originalPosPointA[0]);
        let extraPos = PointOperations.halfwayVector([newPointPos[0], newPointPos[1]], [lastPoint.x, lastPoint.y]);
        let newPoint: PathPoint = {
            x: newPointPos[0],
            y: newPointPos[1],
            method: "L",
            extraX: extraPos[0],
            extraY: extraPos[1],
            type: "round"
        }
        let nextPoint = this.getPoint(originalPosPointA[0] + 1);
        let nextExtraPos = PointOperations.halfwayVector([newPointPos[0], newPointPos[1]], [nextPoint.x, nextPoint.y]);
        nextPoint.extraX = nextExtraPos[0];
        nextPoint.extraY = nextExtraPos[1];
        nextPoint.method = "L";
        this.points.splice(originalPosPointA[0] + 1, 0, newPoint);
    }

    getPointsByDistance(x: number, y: number): { index: number[]; distance: number[] } {
        let distances: number[] = [];
        let originalPosPoint: number[] = [];
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];
            let realPoint = this.rotatePoint([point.x, point.y]);
            let realExtra = (point.extraX !== undefined && point.extraY !== undefined) ? this.rotatePoint([point.extraX, point.extraY]) : [Infinity, Infinity];
            let distance = Math.min(
                PointOperations.vectorLength([realPoint[0] - x, realPoint[1] - y]),
                PointOperations.vectorLength([realExtra[0] - x, realExtra[1] - y] as [number, number])
            );
            let index = 0;
            while (distances[index] !== undefined && distances[index] < distance) {
                index++;
            }
            distances.splice(index, 0, distance);
            originalPosPoint.splice(index, 0, i);
        }
        return {
            index: originalPosPoint,
            distance: distances
        }
    }

    removePoint(x: number, y: number, distanceLimit: number = 512): void {
        let byDistance = this.getPointsByDistance(x, y);
        if (byDistance.distance[0] > distanceLimit) return;
        if (this.points.length <= 3) {
            console.error("Cannot remove the last 2 points of path");
            return;
        }
        if (byDistance.index[0] === this.points.length - 1) {
            this.xOrigin = this.points[this.points.length - 2].x;
            this.yOrigin = this.points[this.points.length - 2].y;
        }
        this.points.splice(byDistance.index[0], 1);
    }

    private limitToArcPoint(point: PathPoint, index: number, x: number, y: number): [number, number] {
        let lastPoint = this.getPoint(index - 1);
        if (lastPoint.x === point.x && lastPoint.y === point.y) {
            return [x, y];
        }
        let middlePoint = PointOperations.halfwayVector([lastPoint.x, lastPoint.y], [point.x, point.y]);
        let distance = PointOperations.lineDistance(x, y, lastPoint.x, lastPoint.y, point.x, point.y);
        let distBetweenPoints = PointOperations.distance(lastPoint.x, lastPoint.y, point.x, point.y);
        let minRadius = distBetweenPoints / 2;
        if (distance > minRadius) distance = minRadius;
        let orthVector = PointOperations.orthogonalVector([point.x - lastPoint.x, point.y - lastPoint.y]);
        orthVector = PointOperations.chooseVectorDirection(middlePoint, orthVector, [x, y]);
        let effectiveDist = distance;
        if (point.type === "round") {
            if ((distance / distBetweenPoints) > this.allowArcRoundingRatio) {
                effectiveDist += this.arcSmoothingDistance;
            }
        }
        orthVector = PointOperations.trimVectorLength(orthVector, UniversalOps.snap(effectiveDist, this.arcSmoothingDistance, [minRadius + this.arcSmoothingDistance]));
        return [middlePoint[0] + orthVector[0], middlePoint[1] + orthVector[1]];
    }

    markerEdited(marker: Marker, limit: number, xPrecise: number, yPrecise: number): any {
        let changes;
        let points = this.copy(this.points) as PathPoint[];
        let neutralizeRotation = (point: [number, number]) => { return PointOperations.rotateAroundPoint(this.center, point, -this.rotation) };
        let pointRotatedToNeutral = neutralizeRotation([marker.x, marker.y]);

        if (marker.memorize === "rotate") {
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: Math.round(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        } else if (marker.memorize === "resize") {
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance / oldDistance);
            changes = {
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin,
                points: this.points
            };
        } else if (typeof marker.memorize === 'number') {
            const index = marker.memorize;
            if (index === points.length - 1) {
                points[index].x = pointRotatedToNeutral[0];
                points[index].y = pointRotatedToNeutral[1];
                this.fixSurroundingPoints(points, index);
                changes = {
                    xOrigin: pointRotatedToNeutral[0],
                    yOrigin: pointRotatedToNeutral[1],
                    points: points
                }
            } else {
                points[index].x = pointRotatedToNeutral[0];
                points[index].y = pointRotatedToNeutral[1];
                this.fixSurroundingPoints(points, index);
                changes = { points: points };
            }
        } else if (typeof marker.memorize === 'string' && marker.memorize.startsWith("extra")) {
            let index = parseInt(marker.memorize.substring(5));
            let point = points[index];
            if (point.method === "L") {
                point.method = "Q";
            }
            if (point.method === "A") {
                let pointRotatedToNeutralPrecise = PointOperations.rotateAroundPoint(this.center, [xPrecise, yPrecise], -this.rotation);
                let limitedPoint = this.limitToArcPoint(point, index, ...pointRotatedToNeutralPrecise);
                point.extraX = limitedPoint[0];
                point.extraY = limitedPoint[1];
            } else {
                point.extraX = pointRotatedToNeutral[0];
                point.extraY = pointRotatedToNeutral[1];
            }
            changes = { points: points };
        }
        return changes;
    }

    fixSurroundingPoints(points: PathPoint[], index: number): PathPoint[] {
        index = parseInt(index.toString());
        let lastIndex = (index === 0) ? points.length - 1 : index - 1;
        let point = points[index];
        let pointExtraPos, nextPoint;
        if (index === points.length - 1) {
            pointExtraPos = PointOperations.halfwayVector([points[points.length - 2].x, points[points.length - 2].y], [point.x, point.y]);
            nextPoint = points[0];
        } else {
            pointExtraPos = PointOperations.halfwayVector([points[lastIndex].x, points[lastIndex].y], [point.x, point.y]);
            nextPoint = points[index + 1];
        }

        if (point.method === "L") {
            point.extraX = pointExtraPos[0];
            point.extraY = pointExtraPos[1];
        } else if (point.method === "A" && point.extraX !== undefined && point.extraY !== undefined) {
            let limitedPoint = this.limitToArcPoint(point, index, point.extraX, point.extraY);
            point.extraX = limitedPoint[0];
            point.extraY = limitedPoint[1];
        }

        if (nextPoint.method === "L") {
            let nextExtraPos = PointOperations.halfwayVector([points[index].x, points[index].y], [nextPoint.x, nextPoint.y]);
            nextPoint.extraX = nextExtraPos[0];
            nextPoint.extraY = nextExtraPos[1];
        } else if (nextPoint.method === "A" && nextPoint.extraX !== undefined && nextPoint.extraY !== undefined) {
            let limitedPoint = this.limitToArcPoint(nextPoint, index + 1, nextPoint.extraX, nextPoint.extraY);
            nextPoint.extraX = limitedPoint[0];
            nextPoint.extraY = limitedPoint[1];
        }
        return points;
    }

    startActiveDraw(x: number, y: number): any {
        return {
            xOrigin: x,
            yOrigin: y,
            points: [{ x: x, y: y, method: "L", type: "round" }]
        }
    }

    movedActiveDraw(x: number, y: number): any {
        let newPoints = this.copy(this.points) as PathPoint[];
        newPoints.pop();
        newPoints.pop();
        let mid;
        if (this.points.length > 1) {
            let point = this.getPoint(this.points.length - 3);
            mid = PointOperations.halfwayVector([point.x, point.y], [x, y]);
        } else {
            mid = PointOperations.halfwayVector([this.xOrigin, this.yOrigin], [x, y]);
        }
        newPoints.push({ x: x, y: y, method: "L", type: "sharp", extraX: mid[0], extraY: mid[1] });
        newPoints.push({ method: "L", x: this.xOrigin, y: this.yOrigin, extraX: 0, extraY: 0, type: "round" });
        return {
            points: newPoints
        }
    }

    releaseActiveDraw(x: number, y: number): any {
        if (PointOperations.distance(this.xOrigin, this.yOrigin, x, y) < this.cancelActiveDrawDistance) {
            this.points.pop();
            this.points.pop();
            let mid = PointOperations.halfwayVector([this.points[this.points.length - 1].x, this.points[this.points.length - 1].y], [x, y]);
            this.points.push({ x: this.xOrigin, y: this.yOrigin, method: "L", extraX: mid[0], extraY: mid[1], type: "round" });
            return undefined;
        } else {
            let newPoints = this.copy(this.points) as PathPoint[];
            let mid = PointOperations.halfwayVector([this.getPoint(this.points.length - 3).x, this.getPoint(this.points.length - 3).y], [x, y]);
            let insertPoint: PathPoint = { x: x, y: y, method: "L", type: "round", extraX: mid[0], extraY: mid[1] };
            newPoints.splice(newPoints.length - 1, 0, insertPoint);
            newPoints[newPoints.length - 3].type = "round";
            return {
                points: newPoints
            }
        }
    }

    activeDrawMarkers(): any[] {
        return [[this.xOrigin, this.yOrigin, undefined, "check"]];
    }

    markerClicked(marker: Marker): void {
        if (marker.memorize !== undefined) {
            let memoStr = String(marker.memorize);
            if (memoStr.startsWith("extra")) {
                let index = parseInt(memoStr.substring(5));
                if (this.points[index].method === "Q" || this.points[index].method === "A") {
                    this.points[index].method = "L";
                    this.fixSurroundingPoints(this.points, index);
                } else {
                    this.points[index].method = "Q";
                }
            } else {
                let index = parseInt(memoStr);
                if (this.points[index].type === "round") {
                    this.points[index].type = "sharp";
                } else {
                    this.points[index].type = "round";
                }
            }
        }
    }

    private arcString(lastPoint: PathPoint, nextPoint: PathPoint, extraPoint: [number, number]): string {
        if (extraPoint[0] === undefined || extraPoint[1] === undefined) return "error";
        if (1 > PointOperations.lineDistance(extraPoint[0], extraPoint[1], lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y) || (lastPoint.x === nextPoint.x && lastPoint.y === nextPoint.y)) {
            return "error";
        }
        let paintBiggerArc = false;
        let rotation = "0";
        let pointsDistance = PointOperations.distance(lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y);
        let mid = PointOperations.halfwayVector([lastPoint.x, lastPoint.y], [nextPoint.x, nextPoint.y]);
        let markerDistance = PointOperations.distance(nextPoint.extraX!, nextPoint.extraY!, mid[0], mid[1]);
        let minRadius = pointsDistance / 2;
        let radius;
        if (markerDistance > minRadius) {
            radius = minRadius;
        } else {
            radius = PointOperations.circleRadius(lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y, extraPoint[0], extraPoint[1], false);
        }
        radius = PointOperations.clearInfinity(radius);
        let sideOfLine = PointOperations.sideOfLine([lastPoint.x, lastPoint.y], [nextPoint.x, nextPoint.y], extraPoint);
        let paintPositiveDegree = (sideOfLine !== "right");
        return `${radius} ${radius} ${rotation} ${(paintBiggerArc) ? "1" : "0"} ${(paintPositiveDegree) ? "1" : "0"} `;
    }

    getPointsString(limitPrecision: boolean = false): string {
        let pointsString: string = "";
        this.points.forEach((point, index) => {
            let elementString: string = "";
            elementString += point.method + " ";
            let gotLastPoint = this.getPoint(index - 1);
            let gotNextPoint = this.getPoint(index + 1);
            let allowArc = !(gotLastPoint.x === point.x && gotLastPoint.y === point.y);

            if ("Q" === point.method) {
                elementString += point.extraX + " " + point.extraY + " ";
            } else if ("A" === point.method && point.extraX !== undefined && point.extraY !== undefined) {
                let arcStr = this.arcString(gotLastPoint, point, [point.extraX, point.extraY]);
                if (arcStr !== "error") {
                    elementString += arcStr;
                } else {
                    elementString = "L ";
                }
            }

            let rounderDistance = (point.rounderDistance === undefined) ? this.defaultEdgeRounderDistance : point.rounderDistance;
            switch (point.type) {
                case "round":
                    if (index !== this.points.length - 1 && this.points.length > 1) {
                        let lastPoint = (point.method === "L") ? [gotLastPoint.x, gotLastPoint.y] : [point.extraX!, point.extraY!];
                        let nextPoint = (this.points[index + 1].method === "L") ? [this.points[index + 1].x, this.points[index + 1].y] : [this.points[index + 1].extraX!, this.points[index + 1].extraY!];
                        let toLastPointVector: [number, number] = [lastPoint[0] - point.x, lastPoint[1] - point.y];
                        let toNextPointVector: [number, number] = [nextPoint[0] - point.x, nextPoint[1] - point.y];
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));

                        if (point.method === "A") {
                            let lastMainPoint = gotLastPoint;
                            let pointsDistance = PointOperations.distance(lastMainPoint.x, lastMainPoint.y, point.x, point.y);
                            let mid = PointOperations.halfwayVector([lastMainPoint.x, lastMainPoint.y], [point.x, point.y]);
                            let markerDistance = PointOperations.distance(point.extraX!, point.extraY!, mid[0], mid[1]);
                            if ((markerDistance / pointsDistance) > this.allowArcRoundingRatio && allowArc) {
                                toLastPointVector = PointOperations.orthogonalVector([point.x - lastMainPoint.x, point.y - lastMainPoint.y]);
                                toLastPointVector = PointOperations.chooseVectorDirection([lastMainPoint.x, lastMainPoint.y], toLastPointVector, [point.extraX!, point.extraY!] as [number, number]);
                                maxRoundingDistancetoLast = this.arcSmoothingDistance;
                            } else {
                                maxRoundingDistancetoLast = 0;
                            }
                        }
                        if (this.getPoint(index + 1).method === "A") {
                            let nextMainPoint = gotNextPoint;
                            let pointsDistance = PointOperations.distance(nextMainPoint.x, nextMainPoint.y, point.x, point.y);
                            let mid = PointOperations.halfwayVector([nextMainPoint.x, nextMainPoint.y], [point.x, point.y]);
                            let markerDistance = PointOperations.distance(nextMainPoint.extraX!, nextMainPoint.extraY!, mid[0], mid[1]);
                            if ((markerDistance / pointsDistance) > this.allowArcRoundingRatio && allowArc) {
                                toNextPointVector = PointOperations.orthogonalVector([point.x - nextMainPoint.x, point.y - nextMainPoint.y]);
                                toNextPointVector = PointOperations.chooseVectorDirection([nextMainPoint.x, nextMainPoint.y], toNextPointVector, [nextMainPoint.extraX!, nextMainPoint.extraY!] as [number, number]);
                                maxRoundingDistancetoNext = this.arcSmoothingDistance;
                            } else {
                                maxRoundingDistancetoNext = 0;
                            }
                        }
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x + toLastPointVector[0], point.y + toLastPointVector[1]];
                        let secondRounderPoint = [point.x + toNextPointVector[0], point.y + toNextPointVector[1]];
                        if (limitPrecision) {
                            firstRounderPoint = [this.pt(firstRounderPoint[0]), this.pt(firstRounderPoint[1])];
                            secondRounderPoint = [this.pt(secondRounderPoint[0]), this.pt(secondRounderPoint[1])];
                        }
                        elementString += firstRounderPoint[0] + " " + firstRounderPoint[1] + " Q " + point.x + " " + point.y + " " + secondRounderPoint[0] + " " + secondRounderPoint[1] + " ";
                        break;
                    } else if (index === this.points.length - 1) {
                        let lastPoint = (point.method === "L") ? [gotLastPoint.x, gotLastPoint.y] : [point.extraX!, point.extraY!];
                        let nextPoint = (this.points[0].method === "L") ? [this.points[0].x, this.points[0].y] : [this.points[0].extraX!, this.points[0].extraY!];
                        let toLastPointVector: [number, number] = [lastPoint[0] - point.x, lastPoint[1] - point.y];
                        let toNextPointVector: [number, number] = [nextPoint[0] - point.x, nextPoint[1] - point.y];
                        let maxRoundingDistancetoLast = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toLastPointVector) - rounderDistance));
                        let maxRoundingDistancetoNext = Math.min(rounderDistance, Math.max(0, PointOperations.vectorLength(toNextPointVector) - rounderDistance));

                        if (point.method === "A") {
                            let lastMainPoint = gotLastPoint;
                            let pointsDistance = PointOperations.distance(lastMainPoint.x, lastMainPoint.y, point.x, point.y);
                            let mid = PointOperations.halfwayVector([lastMainPoint.x, lastMainPoint.y], [point.x, point.y]);
                            let markerDistance = PointOperations.distance(point.extraX!, point.extraY!, mid[0], mid[1]);
                            if ((markerDistance / pointsDistance) > this.allowArcRoundingRatio && allowArc) {
                                toLastPointVector = PointOperations.orthogonalVector([point.x - lastMainPoint.x, point.y - lastMainPoint.y]);
                                toLastPointVector = PointOperations.chooseVectorDirection([lastMainPoint.x, lastMainPoint.y], toLastPointVector, [point.extraX!, point.extraY!] as [number, number]);
                                maxRoundingDistancetoLast = this.arcSmoothingDistance;
                            } else {
                                maxRoundingDistancetoLast = 0;
                            }
                        }
                        if (this.points.length > 1 && this.getPoint(index + 1).method === "A") {
                            let nextMainPoint = gotNextPoint;
                            let pointsDistance = PointOperations.distance(nextMainPoint.x, nextMainPoint.y, point.x, point.y);
                            let mid = PointOperations.halfwayVector([nextMainPoint.x, nextMainPoint.y], [point.x, point.y]);
                            let markerDistance = PointOperations.distance(nextMainPoint.extraX!, nextMainPoint.extraY!, mid[0], mid[1]);
                            if ((markerDistance / pointsDistance) > this.allowArcRoundingRatio && allowArc) {
                                toNextPointVector = PointOperations.orthogonalVector([point.x - nextMainPoint.x, point.y - nextMainPoint.y]);
                                toNextPointVector = PointOperations.chooseVectorDirection([nextMainPoint.x, nextMainPoint.y], toNextPointVector, [nextMainPoint.extraX!, nextMainPoint.extraY!] as [number, number]);
                                maxRoundingDistancetoNext = this.arcSmoothingDistance;
                            } else {
                                maxRoundingDistancetoNext = 0;
                            }
                        }
                        toLastPointVector = PointOperations.trimVectorLength(toLastPointVector, maxRoundingDistancetoLast);
                        toNextPointVector = PointOperations.trimVectorLength(toNextPointVector, maxRoundingDistancetoNext);
                        let firstRounderPoint = [point.x + toLastPointVector[0], point.y + toLastPointVector[1]];
                        let secondRounderPoint = [point.x + toNextPointVector[0], point.y + toNextPointVector[1]];
                        if (limitPrecision) {
                            firstRounderPoint = [this.pt(firstRounderPoint[0]), this.pt(firstRounderPoint[1])];
                            secondRounderPoint = [this.pt(secondRounderPoint[0]), this.pt(secondRounderPoint[1])];
                        }
                        elementString += firstRounderPoint[0] + " " + firstRounderPoint[1] + " Q " + point.x + " " + point.y + " " + secondRounderPoint[0] + " " + secondRounderPoint[1] + " ";
                        pointsString = secondRounderPoint[0] + " " + secondRounderPoint[1] + " " + pointsString;
                        break;
                    }
                default:
                    elementString += point.x + " " + point.y + " ";
                    if (index === this.points.length - 1) {
                        pointsString = point.x + " " + point.y + " " + pointsString;
                    }
                    break;
            }
            pointsString += elementString;
        });
        return pointsString;
    }

    getMarkers(): any[] {
        let r: any[] = [];
        r.push([...this.rotatePoint(PointOperations.orthogonalIcon(this.boundingRect.x, this.boundingRect.y, this.boundingRect.x + this.boundingRect.width, this.boundingRect.y, this.rotationMarkerDistanceFromPattern, "top")), "rotate", "arrow-rotate", this.rotation]);

        let boundingTopLeft: [number, number] = [this.boundingRect.x, this.boundingRect.y];
        let boundingBottomRight: [number, number] = [this.boundingRect.x + this.boundingRect.width, this.boundingRect.y + this.boundingRect.height];
        let scaleMarkerDistance = PointOperations.distance(...boundingTopLeft, ...boundingBottomRight) / 2 + this.rotationMarkerDistanceFromPattern;
        this.scaleMarkerPosition = PointOperations.rotateAroundPoint(this.center, PointOperations.orthogonalIcon(...boundingTopLeft, ...boundingBottomRight, scaleMarkerDistance, "top"), 90);
        r.push([...this.scaleMarkerPosition, "resize", "arrow-resize", 0])

        for (let index in this.points) {
            let point = this.points[index];
            let rotatedPoint = this.rotatePoint([point.x, point.y]);
            if (point.type === "round") {
                r.push([...rotatedPoint, parseInt(index), "point"]);
            } else {
                r.push([...rotatedPoint, parseInt(index), "octagon"]);
            }

            let lastPoint = this.getPoint(parseInt(index) - 1);
            let rotatedExtraPoint = (point.extraX !== undefined && point.extraY !== undefined) ? this.rotatePoint([point.extraX, point.extraY]) : undefined;

            if (point.method === "Q" || point.method === "A") {
                if (rotatedExtraPoint) r.push([...rotatedExtraPoint, "extra" + index, "path_curve"]);
            } else {
                if (PointOperations.vectorLength([point.x - lastPoint.x, point.y - lastPoint.y]) > this.displayCurveMarkersSpaceLimit) {
                    if (rotatedExtraPoint) r.push([rotatedExtraPoint[0], rotatedExtraPoint[1], "extra" + index, "path_straight"]);
                }
            }
        }
        return r;
    }

    getLines(): any[] {
        let l: any[] = [];
        for (let index in this.points) {
            let point = this.points[index];
            if ((point.method === "Q" || point.method === "A") && point.extraX !== undefined && point.extraY !== undefined) {
                let lastPoint = this.getPoint(parseInt(index) - 1);
                let rotatedLastPoint = this.rotatePoint([lastPoint.x, lastPoint.y]);
                let rotatedExtraPoint = this.rotatePoint([point.extraX, point.extraY]);
                let rotatedPoint = this.rotatePoint([point.x, point.y]);
                if ("Q" === point.method) {
                    l.push([...rotatedLastPoint, ...rotatedExtraPoint]);
                    l.push([...rotatedPoint, ...rotatedExtraPoint]);
                } else if ("A" === point.method) {
                    l.push([...PointOperations.halfwayVector(rotatedLastPoint, rotatedPoint), ...rotatedExtraPoint]);
                }
            }
        }
        return l;
    }

    cleanHTML(limitPrecision: boolean = false): string {
        let defaultPattern = new Path(0, 0);
        let paintBorder = (this.borderWidth !== defaultPattern.borderWidth) || (this.borderColor !== defaultPattern.borderColor);
        let pointsString = this.getPointsString(limitPrecision);
        let cleanHTML = ''
            + '<path ' + (this.maskReference())
            + ' d="M ' + pointsString + 'Z"'
            + ' fill="' + this.color
            + '" ' + (paintBorder ? `stroke="${this.borderColor}" ` : '')
            + (paintBorder ? `stroke-width="${this.borderWidth}" ` : '')
            + ((this.rotation % 360 !== defaultPattern.rotation) ? ` transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" ` : '')
            + '/>';
        return cleanHTML;
    }

    get(allowMask: boolean = true): any {
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

    getClass(): any {
        return Path;
    }
}
PatternRegistry.register("Path", Path);
