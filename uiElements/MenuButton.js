class EditorButton{

    element;

    constructor(label, icon, clickHandler){
        //this.top = top;
        //this.left = left;
        this.element = document.createElement("div");
        let iconElement = document.createElement("div");
        iconElement.classList.add("icon");
        let labelElement = document.createElement("span");
        iconElement.innerHTML = icon
        labelElement.innerHTML = label;
        this.element.append(iconElement);
        this.element.append(labelElement);
        //this.element.style.cssText = `top:${this.top}px;left:${this.left}px;`;
        this.element.classList.add("contextmenu-button");
        this.element.addEventListener("mousedown", (mouseEvent)=>{
            mouseEvent.stopPropagation();
        });
        this.element.addEventListener("mousemove", (mouseEvent)=>{
            mouseEvent.stopPropagation();
        });
        this.element.addEventListener("mouseup", (mouseEvent)=>{
            mouseEvent.stopPropagation();
        });
        this.element.addEventListener("click", (mouseEvent)=>{
            clickHandler();
            mouseEvent.stopPropagation();
        });
    }
    addTo(element){
        element.append(this.element);
    }
}