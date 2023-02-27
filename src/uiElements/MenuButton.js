export default class MenuButton{

    element;

    constructor(label, icon, transformation = "", clickHandler){
        this.element = document.createElement("div");
        let iconElement = document.createElement("div");
        iconElement.classList.add("icon");
        iconElement.style.transform = transformation;
        let imgElement = document.createElement("img");
        imgElement.src = icon;
        let labelElement = document.createElement("span");
        iconElement.append(imgElement);
        labelElement.innerHTML = label;
        this.element.append(iconElement);
        this.element.append(labelElement);
        this.element.classList.add("contextmenu-button","clickable");
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