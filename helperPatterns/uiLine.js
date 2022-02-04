class UILine extends HelperPattern{
    constructor(viewportElement, startX, startY, endX, endY, dash = "3,3", memorize){
        super(viewportElement);
        this.x = startX;
        this.y = startY;
        this.endX = endX;
        this.endY = endY;
        this.memorize = memorize;
        this.container.innerHTML = this.elementStart+ new Line(this.x,this.y,this.endX,this.endY,"#000000",1,dash).cleanHTML() +this.elementEnd;
    }
    repaint(){
        this.element.style.cssText = "position:absolute;top:"+"0"+"px;left:"+"0"+"px;height:512px;width:512px;";
    }
}