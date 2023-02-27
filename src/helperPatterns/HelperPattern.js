import IconCreatorGlobal from "../IconCreatorGlobal";

export default class HelperPattern extends IconCreatorGlobal{
    
    container = document.createElement("div");

    drawingViewport;
    
    elementStart = "";

    elementEnd = "</svg>";

    constructor(drawingViewport){
        super();
        this.drawingViewport = drawingViewport;
        this.elementStart="<svg viewBox='"+this.viewBox()+"' style='height:100%;width:100%'>"
        this.container.style.cssText = "pointer-events:none;position:absolute;top:0;left:0;height:100%;width:100%;";
    }
    viewBox(){
        let bodyRect = document.body.getBoundingClientRect();
        let paintPortRect = this.drawingViewport.getBoundingClientRect();
        return "-"+parseInt(paintPortRect.x)+" -"+parseInt(paintPortRect.y)+" "+parseInt(bodyRect.width) + " " + parseInt(bodyRect.height);
    }
}