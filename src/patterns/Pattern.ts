import IconCreatorGlobal from "../IconCreatorGlobal";

import PatternManipulator from "../functionCollections/patternManipulator";
import PointOperations from "../functionCollections/PointOperations.js";
import Marker from "../helperPatterns/marker";
import PatternClassLoader from "../functionCollections/PatternClassLoader";

type Coordinate2d = Array<number>;
type Translation2d = Array<number>;

type MaskLayer = {
    patterns: Array<Pattern>
}

export default class Pattern extends IconCreatorGlobal {

    display: boolean;
    isUI: boolean;
    isMask: boolean;
    isFiller: boolean;
    repaintOnKeyUp: boolean;
    isReference: boolean;
    maskLayer: MaskLayer;
    boundId: boolean;
    rotationSnap: Array<number>;
    snapTolerance: number;
    defaultTranslation: Coordinate2d;
    scaleMarkerPosition: Translation2d;

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
        this.boundId;

        this.rotationSnap = [0, 45, 90, 135, 180, 225, 270, 315];
        this.snapTolerance = 3;
        this.defaultTranslation = [-50, -50];
        this.scaleMarkerPosition = [];

        this.xOrigin = xOrigin;
        this.yOrigin = yOrigin;
    }
    translateMaskTo(newMainOriginX: number, newMainOriginY: number) {
        if (!this.isMask && this.maskLayer) {
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                if (maskItem.isMask) {//only translate mask, because pattern itself is also in the MaskFrame
                    let xDiff = maskItem.xOrigin - this.xOrigin;
                    let yDiff = maskItem.yOrigin - this.yOrigin;
                    maskItem.translateTo(newMainOriginX + xDiff, newMainOriginY + yDiff);
                }
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
    /**
     * Add a maskLayer to this pattern
     */
    addMaskLayer() {
        let maskFillerPattern = PatternManipulator.duplicate(this);
        maskFillerPattern.id = this.id + "filler";
        maskFillerPattern.display = false;
        maskFillerPattern.isMask = true;
        maskFillerPattern.isFiller = true;
        this.maskLayer = {
            patterns: [maskFillerPattern]
        }
    }
    hasMask() {
        return this.maskLayer;
    }
    maskLink() {
        return (!this.isMask) ? ('mask="url(#' + this.id + 'mask)"') : "";
    }
    /**
     * 
     * @param {Number} xPos the x position of the yAxis that should be mirrored around
     */
    mirrorVertically(xPos: number) {
        if (!this.isMask) {
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
     * @param {Number} yPos the y position of the yAxis that should be mirrored around
     */
    mirrorHorizontally(yPos: number) {
        if (!this.isMask) {
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
    mask(limitPrecision: boolean) {
        if (!this.isMask) {
            let maskPatterns = "";
            for (let pos in this.maskLayer.patterns) {
                let maskItem = this.maskLayer.patterns[pos];
                if (maskItem.isMask) {
                    let tempC = maskItem.color;
                    let tempR = maskItem.rotation;
                    if (!maskItem.isFiller) {//all but filler
                        maskItem.color = "#000000";
                        maskItem.borderColor = "#000000";
                    } else {//filler only
                        maskItem.rotation = 0;
                        maskItem.color = "#ffffff";
                        maskItem.borderColor = "#ffffff";
                    }
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
    getMarkers(): Array<Marker> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    startActiveDraw(x: number, y: number) {

    }
    /**
     * Should be overwritten by sub classes
     */
    movedActiveDraw(x: number, y: number) {

    }
    /**
     * Should be overwritten by sub classes
     */
    releaseActiveDraw(x: number, y: number) {

    }
    /**
     * Should be overwritten by sub classes
     */
    activeDrawMarkers(): Array<Marker> {
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
    additionalOptions(x: number, y: number): Array<string> {
        return [];
    }
    /**
     * Should be overwritten by sub classes
     */
    markerClicked(marker: Marker) {

    }
    /**
     * Should be overwritten by sub classes
     */
    afterAlteration() {

    }
    /**
     * Should be overwritten by sub classes
     */
    keypress(event: KeyboardEvent) {
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
     * Should be overwritten by sub classes
     */
    cleanHTML(limitPrecision: boolean): (string | void) {
        console.warn("Unimplemented function used");
    }
    /**
     * This method is required and needs overriding
     */
    getClass() {
        throw "getClass() not implemented in " + this.constructor.name
    }
    /**
     * Return a svg icon that fits in a square viewBox with size 0-8. Should be able to get very small.
     */
    icon() {

    }
    /**
     * Gets called when a marker of a pattern that is edited is changed.
     * @param marker the marker that has been changed. Contains new x,y and memorize
     * @returns the changes that should be done to the pattern
     */
    markerEdited(marker: Marker) {
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
    get() {
        let obj = super.get();
        let additionalAttributes = {
            type: "pattern",
            subtype: this.constructor.name,
            attributes: {
                id: this.id,
                display: this.display,
                isMask: this.isMask,
                isFiller: this.isFiller,//the filler is always identical to the main pattern
                maskLayer: (this.maskLayer) ? {
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
        //if this pattern has been given a mask layer, load the passed data into it
        if (patternJSON.attributes.maskLayer) {
            //@ts-expect-error
            this.maskLayer.patterns = patternJSON.attributes.maskLayer.patterns.map(pattern => {
                let maskPattern = PatternClassLoader.patternClassFromString(pattern.subtype);
                //@ts-expect-error
                maskPattern.load(pattern);
                return maskPattern;
            })
        }
        delete patternJSON.attributes.maskLayer;
        if (!trueCopy) delete patternJSON.attributes.id;
        Object.assign(this, patternJSON.attributes);
    }
}