import Pattern from "./Pattern";
import Rect from "./Rect";
import UniversalOps from "../shared/UniversalOps";
import PointOperations from "../shared/PointOperations";
import Marker from "../helperPatterns/Marker";
import PatternRegistry from "../shared/PatternRegistry";

export default class Text extends Pattern {
    /*
    The Text class shares lots of code with the Rect class, but its is only similiar since the origin point differs
    */
    allowMask: boolean = false;
    repaintOnKeyUp: boolean = true;
    isFocussed: boolean = false;
    isEditing: boolean = false;
    rotation: number = 0;
    defaultTranslation: [number, number] = [-125, 25];
    center: [number, number] = [0, 0];
    cursorPosition: number = 0;
    cursorColor: string = "black";

    content: string;
    width: number;
    height: number;
    borderWidth: number;

    activeOrigin: [number, number] = [0, 0];

    constructor(x: number, y: number, width: number = 250, height: number = 50, content: string = "Doubleclick me", color: string = "#000000", borderWidth: number = 0, borderColor: string = "#000000") {
        super(x, y);
        this.content = content;
        this.color = color;
        this.width = width;
        this.height = height;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.cursorPosition = content.length;
        this.updateProperties();
    }
    translateTo(newOriginX: number, newOriginY: number) {
        this.translateMaskTo(newOriginX, newOriginY);//important to call before manipulating origin, because origin is fetched by mask elements
        this.xOrigin = newOriginX;
        this.yOrigin = newOriginY;
        this.center = this.getCenterUntransformed();
    }
    getCenterUntransformed(): [number, number] {
        return [(this.xOrigin + this.xOrigin + this.width) / 2, this.yOrigin - this.height / 2];
    }
    getCenterProjection(): [number, number] {
        let topLeft = this.topLeft();
        let bottomRight = this.bottomRight();
        return [(topLeft[0] + bottomRight[0]) / 2, (topLeft[1] + bottomRight[1]) / 2];
    }
    /**
     * Translates the pattern, so that projection (rotated rectangle) and rectangle share the same center point. This is important for rotations to always transform around the visual center of the rectangle.
     */
    matchCenters() {
        let realCenter = this.getCenterUntransformed();
        let projectionCenter = this.getCenterProjection();
        let difference = [projectionCenter[0] - realCenter[0], projectionCenter[1] - realCenter[1]];
        this.translateTo(this.xOrigin + difference[0], this.yOrigin + difference[1]);
    }
    mirrorVertically(xPos: number = this.center[0]) {
        super.mirrorVertically(xPos);
    }
    mirrorHorizontally(yPos: number = this.center[1]) {
        super.mirrorHorizontally(yPos);
    }
    updateProperties() {
        if (this.rotation != 0) {
            this.matchCenters();
        }
        this.center = this.getCenterUntransformed();
    }
    topLeft(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin, this.yOrigin - this.height], this.rotation);
    }
    topRight(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin + this.width, this.yOrigin - this.height], this.rotation);
    }
    bottomLeft(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin, this.yOrigin], this.rotation)
    }
    bottomRight(): [number, number] {
        return PointOperations.rotateAroundPoint(this.center, [this.xOrigin + this.width, this.yOrigin], this.rotation)
    }
    //@Override
    markerEdited(marker: any, limit: any, xPrecise: number, yPrecise: number) {
        let changes: any;
        if (marker.memorize == "rotate") {
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: Math.trunc(Number(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))) || 0
            }
        } else if (marker.memorize == "top left") {
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.bottomLeft(), ...this.bottomRight()));
            let newWidth = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.bottomRight(), ...this.topRight()));
            changes = {
                width: newWidth,
                height: newHeight,
                xOrigin: this.xOrigin - (newWidth - this.width),
                //yOrigin: this.yOrigin - (newHeight - this.height)
            }
        } else if (marker.memorize == "top right") {
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.bottomLeft(), ...this.bottomRight()));
            changes = {
                width: PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.bottomLeft()),
                height: newHeight,
                //
            }
        } else if (marker.memorize == "bottom left") {
            let newWidth = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topRight(), ...this.bottomRight()));
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.topRight()));
            changes = {
                width: newWidth,
                height: newHeight,
                xOrigin: this.xOrigin - (newWidth - this.width),
                yOrigin: this.yOrigin + (newHeight - this.height)
            }
        } else if (marker.memorize == "bottom right") {
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.topRight()));
            changes = {
                width: this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.bottomLeft())),
                height: newHeight,
                yOrigin: this.yOrigin + (newHeight - this.height)
            }
        } else if (marker.memorize == "top") {
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.bottomLeft(), ...this.bottomRight()));
            changes = {
                height: newHeight
            }
        } else if (marker.memorize == "bottom") {
            let newHeight = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.topRight()));
            changes = {
                yOrigin: this.yOrigin + (newHeight - this.height),
                height: newHeight
            }
        } else if (marker.memorize == "left") {
            let newWidth = this.pt(PointOperations.lineDistance(marker.x, marker.y, ...this.topRight(), ...this.bottomRight()));
            changes = {
                xOrigin: this.xOrigin - (newWidth - this.width),
                width: newWidth
            }
        } else if (marker.memorize == "right") {
            changes = {
                width: PointOperations.lineDistance(marker.x, marker.y, ...this.topLeft(), ...this.bottomLeft())
            }
        }
        return changes;
    }
    startActiveDraw(x: number, y: number) {
        this.activeOrigin = [x, y];
        return ({
            xOrigin: x,
            yOrigin: y,
            height: 1,
            width: 1
        });
    }
    movedActiveDraw(x: number, y: number) {
        let ogX = this.activeOrigin[0];
        let ogY = this.activeOrigin[1];
        if (ogX > x && ogY > y) {//top left
            return {
                width: ogX - x,
                height: ogY - y,
                xOrigin: x,
                yOrigin: ogY
            }
        } else if (ogX > x && ogY < y) {//bottom left
            return {
                width: ogX - x,
                height: y - ogY,
                xOrigin: x,
                yOrigin: y
            }
        } else if (ogX < x && ogY > y) {//top right
            return {
                width: x - ogX,
                height: ogY - y,
                xOrigin: ogX,
                yOrigin: ogY
            }
        } else if (ogX < x && ogY < y) {//bottom right
            return {
                width: x - ogX,
                height: y - ogY,
                xOrigin: ogX,
                yOrigin: y
            }
        } else {//height or width is 0
            return {};
        }
    }
    //@Override
    getMarkers() {
        let r: any[] = [];
        //rotate marker
        r.push([...this.rotatePoint(PointOperations.orthogonalIcon(this.xOrigin, this.yOrigin - this.height, this.xOrigin + this.width, this.yOrigin - this.height, this.rotationMarkerDistanceFromPattern, "top")), "rotate", "arrow-rotate", this.rotation]);
        //corner markers
        r.push([...this.topLeft(), "top left", "point", this.rotation]);
        r.push([...this.topRight(), "top right", "point", this.rotation]);
        r.push([...this.bottomLeft(), "bottom left", "point", this.rotation]);
        r.push([...this.bottomRight(), "bottom right", "point", this.rotation]);
        //side markers
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin, this.yOrigin], [this.xOrigin, this.yOrigin - this.height])), "left", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin + this.width, this.yOrigin], [this.xOrigin + this.width, this.yOrigin - this.height])), "right", "arrow-double", this.rotation]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin, this.yOrigin - this.height], [this.xOrigin + this.width, this.yOrigin - this.height])), "top", "arrow-double", this.rotation + 90]);
        r.push([...this.rotatePoint(PointOperations.halfwayVector([this.xOrigin, this.yOrigin], [this.xOrigin + this.width, this.yOrigin])), "bottom", "arrow-double", this.rotation + 90]);
        return r;
    }
    //unique to Text class
    getOutline() {
        let outline = new Rect(this.xOrigin, this.yOrigin - this.height, this.width, this.height);
        outline.rotation = this.rotation;
        outline.center = this.center;
        return outline;
    }
    icon() {
        return `
            <path
            d="M 1 1 L 7 1 L 7 3 L 5 3 L 5 7 L 3 7 L 3 3 L 1 3 Z"
            fill="${this.color}"
            ${(this.borderWidth > 0) ? `stroke-width=1 stroke="${this.borderColor}"` : ""}
            />
        `;
    }
    keypress(event: KeyboardEvent) {
        if (this.isEditing) {
            //add chars
            if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                this.addChar(event.key, this.cursorPosition);
            }
            //backspace
            if (event.code === "Backspace" || event.keyCode === 8) {
                if (this.cursorPosition > 0) {
                    this.content = this.content.slice(0, this.cursorPosition - 1) + this.content.slice(this.cursorPosition);
                    this.cursorPosition--;
                }
            }
            //delete
            if (event.code === "Delete" || event.keyCode === 46) {
                if (this.cursorPosition < this.content.length) {
                    this.content = this.content.slice(0, this.cursorPosition) + this.content.slice(this.cursorPosition + 1);
                }
            }
            //left-arrow
            if (event.code === "ArrowLeft" || event.keyCode === 37) {
                if (this.cursorPosition > 0) {
                    this.cursorPosition--;
                }
            }
            //right-arrow
            if (event.code === "ArrowRight" || event.keyCode === 39) {
                if (this.cursorPosition < this.content.length) {
                    this.cursorPosition++;
                }
            }
            return true;//blocks hotkeys from executing
        }
        return false;
    }
    gotFocus() {
        this.isFocussed = true;
    }
    lostFocus() {
        this.isFocussed = false;
        this.isEditing = false;
    }
    doubleclicked() {
        this.isEditing = true;
    }
    addChar(char: string, position: number = this.content.length) {
        this.content = this.content.slice(0, position) + char + this.content.slice(position);
        if (position <= this.cursorPosition) {
            this.cursorPosition++;
        }
    }
    contentWithCursor() {
        return this.content.slice(0, this.cursorPosition) + `<tspan fill="${this.cursorColor}">|</tspan>` + this.content.slice(this.cursorPosition);
    }
    cleanHTML(limitPrecision: boolean = false) {
        let textSize = 32;
        let textCenteringRatio = 3.8;
        let scale = this.height / textSize;
        let defaultPattern = new Text(0, 0);
        let paintBorder = (this.borderWidth != defaultPattern.borderWidth) || (this.borderColor != defaultPattern.borderColor);
        //TODO better marker background
        let cleanHTML = `
        <text ${this.maskReference()}
        x="${this.xOrigin}"
        y="${this.yOrigin / scale - Math.trunc(textSize / textCenteringRatio)}"
        textLength="${this.width}"
        lengthAdjust="spacingAndGlyphs"
        style="font-family:Arial, sans-serif;font-size:${textSize}px"
        text-rendering="optimizeLegibility"
        fill="${this.color}"
        transform="${(this.rotation != 0) ? `rotate(${this.rotation},${this.center[0]},${this.center[1]}) ` : ""}scale(1, ${scale})"
        >${(this.isEditing) ? this.contentWithCursor() : this.content}</text>`;

        return cleanHTML;
    }
    /**
     * Returns the JSON representation of this pattern.
     */
    get(allowMask = true) {
        let obj = super.get(allowMask);
        let additionalAttributes = {
            content: this.content,
            height: this.height,
            width: this.width,
            color: this.color,
            center: this.center,
            rotation: this.rotation,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor
        }
        Object.assign(obj.attributes, additionalAttributes);
        return obj;
    }
    getClass() {
        return Text;
    }
}
PatternRegistry.register("Text", Text);
