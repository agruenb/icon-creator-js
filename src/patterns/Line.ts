import Pattern from "./Pattern";
import PointOperations from "../shared/PointOperations";
import Marker from "../helperPatterns/Marker";

/**
 * A simple line pattern with adjustable terminals and width.
 */
export default class Line extends Pattern {
    xEnd: number;
    yEnd: number;
    color: string;
    width: number;
    stroke: string;
    vector: [number, number] = [0, 0];

    scaleMarkerDistance: number = 0;
    allowMask: boolean = false;
    defaultTranslation: [number, number] = [-50, 0];

    protected scaleMarkerPosition: [number, number] = [0, 0];
    center: [number, number] = [0, 0];

    constructor(x: number, y: number, xEnd: number = 100, yEnd: number = 0, color: string = "#000000", width: number = 32, stroke: string = "") {
        super(x, y);
        this.xEnd = xEnd;
        this.yEnd = yEnd;
        this.color = color;
        this.width = width;
        this.stroke = stroke;
        this.updateProperties();
    }

    translateTo(newOriginX: number, newOriginY: number): void {
        this.translateMaskTo(newOriginX, newOriginY);
        this.xEnd = (this.xEnd - this.xOrigin) + newOriginX;
        this.yEnd = (this.yEnd - this.yOrigin) + newOriginY;
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.updateProperties();
    }

    updateProperties(): void {
        this.vector = this.getVector();
        this.center = this.getCenter();
    }

    getVector(): [number, number] {
        return [this.xEnd - this.xOrigin, this.yEnd - this.yOrigin];
    }

    getCenter(): [number, number] {
        return [PointOperations.halfway(this.xOrigin, this.xEnd), PointOperations.halfway(this.yOrigin, this.yEnd)];
    }

    mirrorVertically(xPos: number = this.center[0]): void {
        super.mirrorVertically(xPos);
        let newOrigin = PointOperations.mirrorPoint(xPos, "y", [this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        let newEnd = PointOperations.mirrorPoint(xPos, "y", [this.xEnd, this.yEnd]);
        this.xEnd = newEnd[0];
        this.yEnd = newEnd[1];
        this.updateProperties();
    }

    mirrorHorizontally(yPos: number = this.center[1]): void {
        super.mirrorHorizontally(yPos);
        let newOrigin = PointOperations.mirrorPoint(yPos, "x", [this.xOrigin, this.yOrigin]);
        this.xOrigin = newOrigin[0];
        this.yOrigin = newOrigin[1];
        let newEnd = PointOperations.mirrorPoint(yPos, "x", [this.xEnd, this.yEnd]);
        this.xEnd = newEnd[0];
        this.yEnd = newEnd[1];
        this.updateProperties();
    }

    resize(scale: number, anchorPoint: [number, number] = this.center): void {
        if (this.allowSizeDecrease()) {
            let newOrigin = PointOperations.scalePoint([this.xOrigin, this.yOrigin], anchorPoint, scale);
            let newEnd = PointOperations.scalePoint([this.xEnd, this.yEnd], anchorPoint, scale);
            this.xOrigin = newOrigin[0];
            this.yOrigin = newOrigin[1];
            this.xEnd = newEnd[0];
            this.yEnd = newEnd[1];
            this.width = this.width * scale;
        } else {
            console.warn("Cannot decrease line size further")
        }
    }

    allowSizeDecrease(): boolean {
        return 1 < PointOperations.distance(this.xOrigin, this.yOrigin, this.xEnd, this.yEnd);
    }

    markerEdited(marker: Marker, limit: number, xPrecise: number, yPrecise: number): any {
        let changes;
        if (marker.memorize === "start") {
            let pointsDontOverlap = (marker.x != this.xEnd || marker.y != this.yEnd);
            changes = {
                xOrigin: (pointsDontOverlap) ? marker.x : marker.x + limit,
                yOrigin: (pointsDontOverlap) ? marker.y : marker.y + limit
            }
        } else if (marker.memorize === "end") {
            let pointsDontOverlap = (marker.x != this.xOrigin || marker.y != this.yOrigin);
            changes = {
                xEnd: (pointsDontOverlap) ? marker.x : marker.x + limit,
                yEnd: (pointsDontOverlap) ? marker.y : marker.y + limit
            }
        } else if (marker.memorize === "width") {
            changes = {
                width: this.pt(2 * PointOperations.lineDistance(marker.x, marker.y, this.xOrigin, this.yOrigin, this.xEnd, this.yEnd))
            }
        } else if (marker.memorize === "resize") {
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance / oldDistance);
            changes = {
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin,
                xEnd: this.xEnd,
                yEnd: this.yEnd,
                width: this.width
            };
        }
        return changes;
    }

    startActiveDraw(x: number, y: number): any {
        return ({
            xOrigin: x,
            yOrigin: y,
            xEnd: x + 5,
            yEnd: y + 5
        });
    }

    movedActiveDraw(x: number, y: number): any {
        let pointsDontOverlap = (x != this.xOrigin || y != this.yOrigin);
        return ({
            xEnd: (pointsDontOverlap) ? x : x + 5,
            yEnd: (pointsDontOverlap) ? y : y + 5
        });
    }

    getMarkers(): any[] {
        let r: any[] = [];
        let angle = PointOperations.angle(this.vector);
        r.push([this.xOrigin, this.yOrigin, "start", "point", angle]);
        r.push([this.xEnd, this.yEnd, "end", "point", angle]);
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin, this.yOrigin, this.xEnd, this.yEnd, this.width / 2, "top");
        r.push([...widthMarkerPos, "width", "arrow-double", angle]);

        let length = PointOperations.distance(this.xOrigin, this.yOrigin, this.xEnd, this.yEnd);
        this.scaleMarkerPosition = [this.center[0] + length / 2 + this.scaleMarkerDistance, this.center[1] + length / 2 + this.scaleMarkerDistance];
        r.push([...this.scaleMarkerPosition, "resize", "arrow-resize", 0]);
        return r;
    }

    getLines(): any[] {
        let l: any[] = [];
        let widthMarkerPos = PointOperations.orthogonalIcon(this.xOrigin, this.yOrigin, this.xEnd, this.yEnd, this.width / 2, "top");
        l.push([PointOperations.halfway(this.xOrigin, this.xEnd), PointOperations.halfway(this.yOrigin, this.yEnd), widthMarkerPos[0], widthMarkerPos[1]]);
        l.push([this.xOrigin, this.yOrigin, this.xEnd, this.yEnd, ""]);
        return l;
    }

    icon(): string {
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

    cleanHTML(): string {
        let defaultPattern = new Line(0, 0);
        let cleanHTML = ''
            + '<line'
            + ' x1="' + this.xOrigin
            + '" y1="' + this.yOrigin
            + '" x2="' + this.xEnd
            + '" y2="' + this.yEnd
            + '" stroke="' + this.color
            + '" stroke-width="' + parseInt(this.width.toString()) + '" '
            + ((this.stroke != defaultPattern.stroke) ? `stroke-dasharray="${this.stroke}" ` : '')
            + ' stroke-linecap="round" />';
        return cleanHTML;
    }

    get(allowMask: boolean = true): any {
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

    getClass(): any {
        return Line;
    }
}
