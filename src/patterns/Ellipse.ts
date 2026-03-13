import Pattern from "./Pattern";
import UniversalOps from "../shared/UniversalOps";
import PointOperations from "../shared/PointOperations";
import Marker from "../helperPatterns/Marker";
import PatternRegistry from "../shared/PatternRegistry";

/**
 * An ellipse pattern that can be rotated, resized, and used as a mask.
 */
export default class Ellipse extends Pattern {
    xRadius: number;
    yRadius: number;
    color: string;
    borderWidth: number;
    borderColor: string;

    allowMask: boolean = true;
    rotation: number = 0;
    center: [number, number] = [0, 0];
    defaultTranslation: [number, number] = [0, 0];
    scaleMarkerDistance: number = 0;

    protected scaleMarkerPosition: [number, number] = [0, 0];

    constructor(x: number, y: number, xRadius: number = 50, yRadius: number = 30, color: string = "#000000", borderWidth: number = 0, borderColor: string = "#000000") {
        super(x, y);
        this.xRadius = xRadius;
        this.yRadius = yRadius;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.updateProperties();
    }

    translateTo(newOriginX: number, newOriginY: number): void {
        this.translateMaskTo(newOriginX, newOriginY);
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = [this.xOrigin, this.yOrigin];
    }

    top(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin, this.yOrigin - this.yRadius], this.rotation);
    }

    right(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin + this.xRadius, this.yOrigin], this.rotation);
    }

    bottom(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin, this.yOrigin + this.yRadius], this.rotation);
    }

    left(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin - this.xRadius, this.yOrigin], this.rotation);
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

    allowSizeDecrease(): boolean {
        return this.xRadius > 1 && this.yRadius > 1;
    }

    resize(scale: number, anchorPoint: [number, number] = this.center): void {
        if (scale > 1 || this.allowSizeDecrease()) {
            this.xRadius = this.xRadius * scale;
            this.yRadius = this.yRadius * scale;
        } else {
            console.warn("Cannot resize Ellipse further");
        }
    }

    updateProperties(): void {
        this.center = [this.xOrigin, this.yOrigin];
    }

    markerEdited(marker: Marker, limit: number, xPrecise: number, yPrecise: number): any {
        let changes;
        if (marker.memorize === "rotate") {
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: Math.round(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        } else if (marker.memorize === "xRadius") {
            changes = {
                xRadius: this.pt(Math.max(limit, PointOperations.lineDistance(marker.x, marker.y, ...this.top(), ...this.bottom())))
            }
        } else if (marker.memorize === "yRadius") {
            changes = {
                yRadius: this.pt(Math.max(limit, PointOperations.lineDistance(marker.x, marker.y, ...this.left(), ...this.right())))
            }
        } else if (marker.memorize === "resize") {
            let oldDistance = PointOperations.distance(...this.center, ...this.scaleMarkerPosition);
            let newDistance = PointOperations.distance(...this.center, xPrecise, yPrecise);
            this.resize(newDistance / oldDistance);
            changes = {
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin,
                xRadius: this.xRadius,
                yRadius: this.yRadius
            };
        }
        return changes;
    }

    startActiveDraw(x: number, y: number): any {
        return ({
            xOrigin: x,
            yOrigin: y,
            xRadius: 10,
            yRadius: 15
        });
    }

    movedActiveDraw(x: number, y: number): any {
        return ({
            xRadius: this.pt(Math.max(10, PointOperations.lineDistance(x, y, ...this.top(), ...this.bottom()))),
            yRadius: this.pt(Math.max(10, PointOperations.lineDistance(x, y, ...this.left(), ...this.right()))),
        });
    }

    getMarkers(): any[] {
        let r: any[] = [];
        let vectorFromCenter = PointOperations.trimVectorLength([0, -this.xRadius], this.yRadius + this.rotationMarkerDistanceFromPattern);
        let rotationMarkerPoint: [number, number] = [this.xOrigin + vectorFromCenter[0], this.yOrigin + vectorFromCenter[1]];
        r.push([...this.rotatePoint(rotationMarkerPoint), "rotate", "arrow-rotate", this.rotation]);
        r.push([...this.top(), "yRadius", "arrow-double", this.rotation + 90]);
        r.push([...this.right(), "xRadius", "arrow-double", this.rotation]);
        r.push([...this.left(), "xRadius", "arrow-double", this.rotation]);
        r.push([...this.bottom(), "yRadius", "arrow-double", this.rotation + 90]);

        this.scaleMarkerPosition = [this.center[0] + this.xRadius + this.scaleMarkerDistance, this.center[1] + this.yRadius + this.scaleMarkerDistance];
        r.push([...this.scaleMarkerPosition, "resize", "arrow-resize", 0]);
        return r;
    }

    icon(): string {
        return `
            <ellipse
            cx="4"
            cy="4"
            rx="3.5"
            ry="2.5"
            fill="${this.color}"
            ${(this.borderWidth > 0) ? `stroke-width=1 stroke="${this.borderColor}"` : ""}
            />
        `;
    }

    cleanHTML(): string {
        let defaultPattern = new Ellipse(0, 0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        let cleanHTML = ''
            + '<ellipse ' + (this.maskReference())
            + 'cx="' + this.xOrigin
            + '" cy="' + this.yOrigin
            + '" rx="' + this.xRadius
            + '" ry="' + this.yRadius
            + '" fill="' + this.color
            + '" ' + (paintBorder ? `stroke="${this.borderColor}" ` : '')
            + (paintBorder ? `stroke-width="${this.borderWidth}" ` : '')
            + ((this.rotation != defaultPattern.rotation) ? `transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" ` : '')
            + '/>';
        return cleanHTML;
    }

    get(allowMask: boolean = true): any {
        let obj = super.get(allowMask);
        let additionalAttributes = {
            xRadius: this.xRadius,
            yRadius: this.yRadius,
            color: this.color,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            rotation: this.rotation,
            center: this.center
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }

    getClass(): any {
        return Ellipse;
    }
}
PatternRegistry.register("Ellipse", Ellipse);
