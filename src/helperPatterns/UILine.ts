import HelperPattern from "./HelperPattern";
import Line from "../patterns/Line";

/**
 * A UILine is a helper pattern that draws a dashed line between two points.
 */
export default class UILine extends HelperPattern {
    x: number;
    y: number;
    endX: number;
    endY: number;
    memorize?: string;

    constructor(viewportElement: HTMLElement, startX: number, startY: number, endX: number, endY: number, dash: string = "3,3", memorize?: string) {
        super(viewportElement);
        this.x = startX;
        this.y = startY;
        this.endX = endX;
        this.endY = endY;
        this.memorize = memorize;
        this.container.innerHTML = this.elementStart + new Line(this.x, this.y, this.endX, this.endY, "#000000", 1, dash).cleanHTML() + this.elementEnd;
    }

    /**
     * Repaints the UI line by setting its container style.
     */
    repaint(): void {
        // Note: original JS referred to this.element which might be container. Checking if it should be this.container
        this.container.style.cssText = "position:absolute;top:" + "0" + "px;left:" + "0" + "px;height:512px;width:512px;";
    }
}
