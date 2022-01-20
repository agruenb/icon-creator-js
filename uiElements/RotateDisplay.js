class RotateDisplay{

    element = document.createElement("div");
    canvas = document.createElement("canvas");
    innerElement = document.createElement("div");
    size = 30;
    progressCircleWidth = 5;
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
        this.canvas.style.cssText = "height:100%;width:100%;top:0;left:0;position:absolute;z-index:-1;";
        this.element.append(this.canvas, this.innerElement);
        this.update();
    }
    update(){
        let viewRect = this.viewport.getBoundingClientRect();
        let style = `position:absolute;
            left:${viewRect.x + this.x - this.size/2}px;
            top:${viewRect.y + this.y - this.size/2}px;`;
        //draw progress circle
        var ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = this.background;
        ctx.strokeStyle = this.color;
        ctx.fillRect(0,0,this.size,this.size);
        ctx.lineWidth = this.progressCircleWidth;
        ctx.arc(this.size/2, this.size/2, (this.size - this.progressCircleWidth )/2 + 2, Math.PI*1.5, PointOperations.radians(this.rotation)-Math.PI/2);
        ctx.stroke();
        this.element.style.cssText = style;
        this.innerElement.innerHTML = this.rotation+"°";
    }
    addTo(element){
        element.append(this.element);
    }
}