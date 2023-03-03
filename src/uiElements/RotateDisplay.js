import PointOperations from "../shared/PointOperations";

export default class RotateDisplay{

    element = document.createElement("div");
    canvas = document.createElement("canvas");
    innerElement = document.createElement("div");
    size = 60;
    cssWidth = 30;
    progressCircleWidth = 6;
    color = "#000000";
    background = "#ffffff";

    constructor(viewportElement, x, y, rotation = 0){
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
    update(){
        let halfSize = this.size/2;
        let viewRect = this.viewport.getBoundingClientRect();
        let style = `position:absolute;
            left:${viewRect.x + this.x - this.cssWidth/2}px;
            top:${viewRect.y + this.y - this.cssWidth/2}px;`;
        //draw progress circle
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.background;
        ctx.fillRect(0,0,this.size,this.size);

        ctx.beginPath();
        ctx.moveTo(halfSize, 0);
        let radiantProgress = PointOperations.radians(this.rotation)-Math.PI/2;
        //upper arc
        ctx.arc(halfSize, halfSize, halfSize, Math.PI*1.5, radiantProgress);
        //endpoint curve
        let endpointCenter = PointOperations.rotateAroundPoint([halfSize, halfSize],[halfSize, this.progressCircleWidth/2], this.rotation);
        ctx.arc(...endpointCenter, this.progressCircleWidth/2, radiantProgress, radiantProgress+Math.PI);
        //lower arc
        ctx.arc(halfSize, halfSize, halfSize-this.progressCircleWidth, radiantProgress, Math.PI*1.5, true);
        //endpoint curve
        ctx.arc(halfSize, this.progressCircleWidth/2, this.progressCircleWidth/2, Math.PI*0.5, Math.PI*1.5);
        //fill
        ctx.fillStyle = "#000000";
        ctx.fill();
        this.element.style.cssText = style;
        this.innerElement.innerHTML = this.rotation+"°";
    }
    addTo(element){
        element.append(this.element);
    }
}