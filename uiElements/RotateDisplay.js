class RotateDisplay{

    element = document.createElement("div");
    size = 30;
    background = "#ff6347";
    progress = "#2f3439";

    constructor(viewportElement, x, y, rotation = 0){
        this.viewport = viewportElement;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.update();
    }
    update(){
        let viewRect = this.viewport.getBoundingClientRect();
        let style = `position:absolute;
            left:${viewRect.x + this.x - this.size/2}px;
            top:${viewRect.y + this.y - this.size/2}px;
            height:${this.size}px;
            width:${this.size}px;
            border-radius:${this.size/2}px;`;
        if(this.rotation === 0){
            style+= `background-color:${this.background};`;
        }
        else if(this.rotation <= 180){
            style+= `
                background-image: linear-gradient(90deg, ${this.background} 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0)), 
                linear-gradient(${this.rotation - 90}deg, ${this.background} 50%, ${this.progress} 50%, #2f3439);
                `;
        }else{
            style+= `
                background-image: linear-gradient(270deg, ${this.progress} 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0)), 
                linear-gradient(${this.rotation - 90}deg, ${this.background} 50%, ${this.progress} 50%, #2f3439);
                `;
        }
        
        this.element.style.cssText = style;
        //this.element.innerHTML = this.rotation;
    }
    addTo(element){
        element.append(this.element);
    }
}