import IconCreatorGlobal from "../IconCreatorGlobal";

import PatternManipulator from "../shared/patternManipulator";
import PointOperations from "../shared/PointOperations";
import PatternRegistry from "../shared/PatternRegistry";
import Marker from "../helperPatterns/Marker";

export type Coordinate2d = [number, number];
export type Translation2d = [number, number];

export type MaskLayer = {
    patterns: Array<Pattern>
}

export default class Pattern extends IconCreatorGlobal {

    display: boolean;
    isUI: boolean;
    isMask: boolean;
    isFiller: boolean;
    repaintOnKeyUp: boolean;
    isReference: boolean;
    maskLayer: MaskLayer | undefined;
    //@ts-ignore
    boundId: string | undefined;
    rotationSnap: Array<number>;
    snapTolerance: number;
    defaultTranslation: Translation2d;
    protected scaleMarkerPosition: Coordinate2d;

    displayName: string;

    xOrigin: number;
    yOrigin: number;

    color: string;
    borderColor: string;
    rotation: number;

    center: Coordinate2d;

    constructor(xOrigin = 0, yOrigin = 0) {
        super();

        this.display = true;

        this.isUI = false;
        this.isMask = false;
        this.isFiller = false;//the filler is always identical to the main pattern
        this.repaintOnKeyUp = false;
        this.isReference = false;
        this.maskLayer = undefined;

        this.rotationSnap = [0, 45, 90, 135, 180, 225, 270, 315];
        this.snapTolerance = 3;
        this.defaultTranslation = [-50, -50];
        this.scaleMarkerPosition = [0, 0];

        this.displayName = "Shape";

        this.xOrigin = xOrigin;
        this.yOrigin = yOrigin;

        this.color = "#000000";
        this.borderColor = "#000000";
        this.rotation = 0;
        this.center = [0, 0];
    }
    translateMaskTo(newMainOriginX: number, newMainOriginY: number) {
        if (!this.isMask && this.maskLayer) {
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                let xDiff = maskItem.xOrigin - this.xOrigin;
                let yDiff = maskItem.yOrigin - this.yOrigin;
                maskItem.translateTo(newMainOriginX + xDiff, newMainOriginY + yDiff);
            }
        }
    }
    translateTo(newOriginX: number, newOriginY: number) {
        console.warn("Unimplemented function used");
    }
    resize(scale: number) {
        console.warn("Unimplemented function used");
    }
    /**
     * Translates the pattern to is default location. This is necessary because all patterns are created at
     * [0, 0] which not always looks good
     */
    initialDefaultTranslation() {
        this.translateTo(this.xOrigin + this.defaultTranslation[0], this.yOrigin + this.defaultTranslation[1]);
    }
    hasMask(): boolean {
        return this.maskLayer != undefined && !this.isMask && (this.maskLayer.patterns !== undefined) && this.maskLayer.patterns.length > 0;
    }
    maskReference(): string {
        return (this.hasMask()) ? ('mask="url(#' + this.id + 'mask)"') : "";
    }
    /**
     * 
     * @param {number} xPos the x position of the yAxis that should be mirrored around
     */
    mirrorVertically(xPos: number) {
        if (this.hasMask() && this.maskLayer) {
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                if (maskItem.isMask) {
                    maskItem.mirrorVertically(xPos);
                }
            }
        }
    }
    /**
     * 
     * @param {number} yPos the y position of the yAxis that should be mirrored around
     */
    mirrorHorizontally(yPos: number) {
        if (this.hasMask() && this.maskLayer) {
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                if (maskItem.isMask) {
                    maskItem.mirrorHorizontally(yPos);
                }
            }
        }
    }
    /**
     * Get html string of mask
     * @param limitPrecision 
     * @returns html string of mask
     */
    mask(limitPrecision: boolean): string {
        if (!this.isMask && this.maskLayer) {
            let maskPatterns = "";
            //add mask filler
            let fillerPattern = PatternManipulator.duplicate(this);
            fillerPattern.isMask = true;
            fillerPattern.isFiller = true;
            fillerPattern.color = "#ffffff";
            fillerPattern.borderColor = "#ffffff";
            fillerPattern.rotation = 0;
            maskPatterns += fillerPattern.cleanHTML(limitPrecision);
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                if (maskItem.isMask) {
                    let tempC = maskItem.color;
                    let tempR = maskItem.rotation;
                    maskItem.color = "#000000";
                    maskItem.borderColor = "#000000";
                    maskPatterns += maskItem.cleanHTML(limitPrecision);
                    maskItem.color = tempC;
                    maskItem.borderColor = tempC;
                    maskItem.rotation = tempR;
                }
            }
            let maskString = '<defs><mask id="' + this.id + 'mask">' + maskPatterns + '</mask></defs>';
            return maskString;
        } else {
            return "<defs></defs>";
        }
    }
    /**
     * Updates properties that depend on others but are not directly set.
     */
    updateProperties() { }
    /**
     * Should be overwritten by sub classes
     */
    getMarkers(): Array<any> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    startActiveDraw(x: number, y: number): any {

    }
    /**
     * Should be overwritten by sub classes
     */
    movedActiveDraw(x: number, y: number): any {

    }
    /**
     * Should be overwritten by sub classes
     */
    releaseActiveDraw(x: number, y: number) {

    }
    /**
     * Should be overwritten by sub classes
     */
    activeDrawMarkers(): Array<any> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    getLines(): Array<Pattern> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    additionalOptions(x: number, y: number, repaint: () => void): Array<any> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    markerClicked(marker: any) {

    }
    /**
     * Should be overwritten by sub classes
     */
    afterAlteration() {

    }
    /**
     * Should be overwritten by sub classes
     */
    keypress(event: KeyboardEvent): boolean {
        return false;//whether further hotkey should be blocked
    }
    /**
     * Should be overwritten by sub classes
     */
    doubleclicked() {

    }
    /**
     * Should be overwritten by sub classes
     */
    gotFocus() {

    }
    /**
     * Should be overwritten by sub classes
     */
    lostFocus() {

    }
    /**
     * Optional. If not overwritten the pattern itself is used for outline.
     * @returns 
     */
    getOutline(): any {
        return PatternManipulator.duplicate(this);
    }
    /**
     * Should be overwritten by sub classes
     */
    cleanHTML(limitPrecision: boolean): string {
        console.warn("Unimplemented function used");
        return "";
    }
    /**
     * This method is required and needs overriding
     */
    getClass(): any {
        throw "getClass() not implemented in " + this.constructor.name
    }
    /**
     * Return a svg icon that fits in a square viewBox with size 0-8. Should be able to get very small.
     */
    icon(): string {
        return "";
    }
    /**
     * Gets called when a marker of a pattern that is edited is changed.
     * @param marker the marker that has been changed. Contains new x,y and memorize
     * @returns the changes that should be done to the pattern
     */
    markerEdited(marker: any, limit?: any, xPrecise?: number, yPrecise?: number): any {
        return {};
    }
    /**
     * Rotates a point around the patterns center by as much as the pattern itself is rotated
     */
    rotatePoint(point: Coordinate2d, reverse = false) {
        if (this.center === undefined || this.rotation === undefined) {
            console.warn("using rotatePoint() requires center and rotation");
        }
        let rotation = (reverse) ? -this.rotation : this.rotation;
        return PointOperations.rotateAroundPoint(this.center, point, rotation);
    };
    fullHTML(systemAttributes = false, limitPrecision = false) {
        return ((this.hasMask()) ? this.mask(limitPrecision) : "") + this.cleanHTML(limitPrecision);
    }
    /**
     * Returns the JSON representation of this pattern.
     */
    get(allowMask?: boolean): any {
        let obj = super.get();
        let additionalAttributes = {
            type: "pattern",
            subtype: this.constructor.name,
            attributes: {
                id: this.id,
                display: this.display,
                isMask: this.isMask,
                maskLayer: (this.hasMask() && this.maskLayer) ? {
                    patterns: this.maskLayer.patterns.map(pattern => pattern.get()),
                } : undefined,
                boundId: this.boundId,
                xOrigin: this.xOrigin,
                yOrigin: this.yOrigin
            }
        }
        Object.assign(obj, additionalAttributes);
        return obj;
    }
    load(patternJSON: any, trueCopy = true) {
        patternJSON = this.copy(patternJSON);//copy attributes so no objects are shared between pattern and other pattern
        //check for correct data-type
        if (this.constructor.name != patternJSON.subtype) {
            console.trace();
            console.error(`Cannot load ${this.constructor.name} from ${patternJSON.subtype}`);
            return;
        }
        //if this pattern has been given a mask layer, add it
        if (patternJSON.attributes.maskLayer) {
            this.maskLayer = {
                patterns: []
            };

            this.maskLayer.patterns = patternJSON.attributes.maskLayer.patterns.map((pattern: any) => {
                let MaskPatternClass = PatternRegistry.getClass(pattern.subtype);
                if (!MaskPatternClass) {
                    console.error(`Unknown pattern class: ${pattern.subtype}`);
                    return null;
                }
                let maskPattern = new MaskPatternClass(0, 0)
                maskPattern.load(pattern);
                return maskPattern;
            }).filter((p: any) => p !== null)
        }
        delete patternJSON.attributes.maskLayer;
        if (!trueCopy) delete patternJSON.attributes.id;
        Object.assign(this, patternJSON.attributes);
    }
}