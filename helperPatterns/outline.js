class Outline extends HelperPattern{
    constructor(viewportElement,pattern,memorize){
        super(viewportElement);
        this.memorize = memorize;
        this.ownPattern = pattern.getOutlinePattern();
        //not all patterns get an outline
        if(["Line"].indexOf(pattern.constructor.name) == -1){
            this.ownPattern.isUI = true;
            this.ownPattern.color = "transparent";
            this.ownPattern.borderColor = "#000001";//"#307ffd";
            this.ownPattern.borderWidth = 1;
            this.container.innerHTML = this.elementStart+this.ownPattern.cleanHTML()+this.elementEnd;
        }
    }
    repaint(){
        //this.element.style.cssText = "pointer-events:none;position:absolute;top:0;left:0;height:100%;width:100%;";
    }
}