import PointOperations from "../shared/PointOperations";

/**
 * A UI display for rotation, showing a progress circle and angle in degrees.
 */
export default class RotateDisplay {
    element: HTMLDivElement = document.createElement("div");
    canvas: HTMLCanvasElement = document.createElement("canvas");
    innerElement: HTMLDivElement = document.createElement("div");

    size: number = 60;
    cssWidth: number = 30;
    progressCircleWidth: number = 6;
    color: string = "#000000";
    background: string = "#ffffff";

    viewport: HTMLElement;
    x: number;
    y: number;
    rotation: number;

    /**
     * @param viewportElement - The viewport/frame container
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @param rotation - Current rotation in degrees
     */
    constructor(viewportElement: HTMLElement, x: number, y: number, rotation: number = 0) {
        this.viewport = viewportElement;
        this.x = x;
        this.y = y;
        this.rotation = rotation;

        this.element.classList.add("rotate-display");
        this.innerElement.classList.add("text-box");

        this.canvas.height = this.size;
        this.canvas.width = this.size;
        this.canvas.style.cssText = "height:100%;width:100%;";

        this.element.append(this.canvas, this.innerElement);
        this.update();
    }

    /**
     * Re-renders the rotation progress circle on the canvas and updates the position.
     */
    update(): void {
        let halfSize = this.size / 2;
        let viewRect = this.viewport.getBoundingClientRect();
        let style = `position:absolute;
            left:${viewRect.x + this.x - this.cssWidth / 2}px;
            top:${viewRect.y + this.y - this.cssWidth / 2}px;`;

        // draw progress circle
        let ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, this.size, this.size);

        ctx.beginPath();
        ctx.moveTo(halfSize, 0);
        let radiantProgress = PointOperations.radians(this.rotation) - Math.PI / 2;

        // upper arc
        ctx.arc(halfSize, halfSize, halfSize, Math.PI * 1.5, radiantProgress);
        // endpoint curve
        let endpointCenter = PointOperations.rotateAroundPoint([halfSize, halfSize], [halfSize, this.progressCircleWidth / 2], this.rotation);
        ctx.arc(endpointCenter[0], endpointCenter[1], this.progressCircleWidth / 2, radiantProgress, radiantProgress + Math.PI);
        // lower arc
        ctx.arc(halfSize, halfSize, halfSize - this.progressCircleWidth, radiantProgress, Math.PI * 1.5, true);
        // endpoint curve
        ctx.arc(halfSize, this.progressCircleWidth / 2, this.progressCircleWidth / 2, Math.PI * 0.5, Math.PI * 1.5);

        // fill
        ctx.fillStyle = "#000000";
        ctx.fill();

        this.element.style.cssText = style;
        this.innerElement.innerHTML = Math.round(this.rotation) + "°";
    }

    /**
     * Appends the rotate display to a parent element.
     * @param element - The parent element
     */
    addTo(element: HTMLElement): void {
        element.append(this.element);
    }
}
