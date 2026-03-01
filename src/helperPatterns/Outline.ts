import HelperPattern from "./HelperPattern";

/**
 * An outline is a helper UI pattern that draws a border around a specific pattern.
 */
export default class Outline extends HelperPattern {
    memorize?: string;
    ownPattern: any;

    constructor(viewportElement: HTMLElement, pattern: any, memorize?: string) {
        super(viewportElement);
        this.memorize = memorize;
        this.ownPattern = pattern.getOutline();

        if (this.ownPattern.maskLayer) {
            delete this.ownPattern.maskLayer;
        }

        // Not all patterns get an outline
        if (pattern.constructor.name !== "Line") {
            this.ownPattern.isUI = true;
            this.ownPattern.color = "transparent";
            this.ownPattern.borderColor = "#000001"; // "#307ffd"
            this.ownPattern.borderWidth = 1;
            this.container.innerHTML = this.elementStart + this.ownPattern.cleanHTML() + this.elementEnd;
        }
    }

    /**
     * Repaints the outline. (Currently a placeholder)
     */
    repaint(): void {
        // this.element.style.cssText = "pointer-events:none;position:absolute;top:0;left:0;height:100%;width:100%;";
    }
}
