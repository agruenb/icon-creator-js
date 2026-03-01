import IconCreatorGlobal from "../IconCreatorGlobal";

/**
 * Base class for helper UI patterns that overlay the drawing viewport.
 */
export default class HelperPattern extends IconCreatorGlobal {

    container: HTMLDivElement = document.createElement("div");

    drawingViewport: HTMLElement;

    elementStart: string = "";

    elementEnd: string = "</svg>";

    constructor(drawingViewport: HTMLElement) {
        super();
        this.drawingViewport = drawingViewport;
        this.elementStart = "<svg viewBox='" + this.viewBox() + "' style='height:100%;width:100%'>";
        this.container.style.cssText = "pointer-events:none;position:absolute;top:0;left:0;height:100%;width:100%;";
    }

    /**
     * Calculates the viewBox for the helper pattern based on the viewport and body dimensions.
     * @returns A string representation of the SVG viewBox
     */
    viewBox(): string {
        let bodyRect = document.body.getBoundingClientRect();
        let paintPortRect = this.drawingViewport.getBoundingClientRect();
        return "-" + Math.floor(paintPortRect.x) + " -" + Math.floor(paintPortRect.y) + " " + Math.floor(bodyRect.width) + " " + Math.floor(bodyRect.height);
    }
}
