class Outline extends HelperPattern{
    constructor(viewportElement,pattern,memorize){
        super(viewportElement);
        this.memorize = memorize;
        switch (pattern.constructor.name) {
            case "Rect":
                this.ownPattern = new Rect();
                break;
            case "Circle":
                this.ownPattern = new Circle();
                break;
            case "Ellipse":
                this.ownPattern = new Ellipse();
                break;
            case "Line":
                this.ownPattern = new Line();
                break;
            case "Path":
                this.ownPattern = new Path();
                break;
            default:
                break;
        }
        //not all patterns get an outline
        if(["Line"].indexOf(pattern.constructor.name) == -1){
            this.ownPattern.load(pattern.get());
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