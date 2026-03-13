import Pattern, { Coordinate2d, Translation2d } from "./Pattern";
import PointOperations from "../shared/PointOperations";
import UniversalOps from "../shared/UniversalOps";
import PatternRegistry from "../shared/PatternRegistry";

/**
 * Circle pattern - a basic SVG circle shape with support for masking, rotation, and scaling.
 */
export default class Circle extends Pattern {

    allowMask: boolean = true;
    rotation: number = 0;
    defaultTranslation: Translation2d = [0, 0];
    radius: number;
    borderWidth: number;
    scaleMarkerDistance: number;

    constructor(x: number = 0, y: number = 0, radius: number = 50, color: string = "#000000", borderWidth: number = 0, borderColor: string = "#000000") {
        super(x, y);
        this.radius = radius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        //static
        this.scaleMarkerDistance = 0;
        this.updateProperties();
    }

    translateTo(newOriginX: number, newOriginY: number): void {
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = [this.xOrigin, this.yOrigin];
    }

    updateProperties(): void {
        this.center = [this.xOrigin, this.yOrigin];
    }

    mirrorVertically(xPos: number = this.center[0]): void {
        super.mirrorVertically(xPos);
        if (this.isMask) {
            this.rotation = 360 - this.rotation;
        }
        this.xOrigin = PointOperations.mirrorPoint(xPos, "y", [this.xOrigin, this.yOrigin])[0];
        this.updateProperties();
    }

    mirrorHorizontally(yPos: number = this.center[1]): void {
        super.mirrorHorizontally(yPos);
        if (this.isMask) {
            this.rotation = 180 - this.rotation;
            if (this.rotation < 0) {
                this.rotation = 360 + this.rotation;
            }
        }
        this.yOrigin = PointOperations.mirrorPoint(yPos, "x", [this.xOrigin, this.yOrigin])[1];
        this.updateProperties();
    }

    resize(scale: number, anchorPoint: Coordinate2d = this.center): void {
        //min width and height of 1
        if (scale > 1 || this.allowSizeDecrease()) {
            this.radius = this.radius * scale;
        } else {
            console.warn("Cannot resize Circle further");
        }
    }

    allowSizeDecrease(): boolean {
        return this.radius > 1;
    }

    markerEdited(marker: any, limit: number, xPrecise: number, yPrecise: number): any {
        let changes: any;
        if (marker.memorize == "rotate") {
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: Math.round(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        } else if (marker.memorize == "radius") {
            changes = {
                radius: this.pt(Math.max(limit, PointOperations.distance(this.xOrigin, this.yOrigin, marker.x, marker.y)))
            }
        } else if (marker.memorize === "resize") {
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance / oldDistance);
            changes = {
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin,
                radius: this.radius
            };
        }
        return changes;
    }

    startActiveDraw(x: number, y: number): any {
        return ({
            xOrigin: x,
            yOrigin: y,
            radius: 10
        });
    }

    movedActiveDraw(x: number, y: number): any {
        return ({
            radius: this.pt(Math.max(10, PointOperations.distance(this.xOrigin, this.yOrigin, x, y)))
        });
    }

    getMarkers(): any[] {
        let r: any[] = [];
        let rotatePoint: Coordinate2d = [this.xOrigin, this.yOrigin - this.radius - this.rotationMarkerDistanceFromPattern];
        r.push([...this.rotatePoint(rotatePoint), "rotate", "arrow-rotate", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin + this.radius, this.yOrigin]), "radius", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin - this.radius, this.yOrigin]), "radius", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint([this.xOrigin, this.yOrigin + this.radius]), "radius", "arrow-double", this.rotation + 90]);
        r.push([...this.rotatePoint([this.xOrigin, this.yOrigin - this.radius]), "radius", "arrow-double", this.rotation + 90]);
        //scale
        this.scaleMarkerPosition = [this.center[0] + this.radius + this.scaleMarkerDistance, this.center[1] + this.radius + this.scaleMarkerDistance];
        r.push([...this.scaleMarkerPosition, "resize", "arrow-resize", 0]);
        return r;
    }

    icon(): string {
        return `
            <circle
            cx="4"
            cy="4"
            r="3"
            fill="${this.color}"
            ${(this.borderWidth > 0) ? `stroke-width=1 stroke="${this.borderColor}"` : ""}
            />
        `;
    }

    cleanHTML(limitPrecision: boolean = false): string {
        let defaultPattern = new Circle(0, 0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
            + '<circle ' + (this.maskReference())
            + ' cx="' + this.xOrigin
            + '" cy="' + this.yOrigin
            + '" r="' + this.radius
            + '" fill="' + this.color
            + '" ' + (paintBorder ? `stroke="${this.borderColor}" ` : '')
            + (paintBorder ? `stroke-width="${this.borderWidth}" ` : '')
            + ((this.rotation != defaultPattern.rotation) ? `transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" ` : '')
            + '/>';
        return cleanHTML;
    }

    /**
     * Returns the JSON representation of this pattern.
     */
    get(allowMask: boolean = true): any {
        let obj = super.get(allowMask);
        let additionalAttributes = {
            radius: this.radius,
            color: this.color,
            center: this.center,
            rotation: this.rotation,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }

    getClass(): typeof Circle {
        return Circle;
    }
}
PatternRegistry.register("Circle", Circle);
