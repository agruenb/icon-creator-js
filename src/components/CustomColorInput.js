import IconCreatorGlobal from "../IconCreatorGlobal";

export default class CustomColorInput extends IconCreatorGlobal{
    constructor(className = "", color){
        super();
        //display
        let display = document.createElement("label");
        display.classList.add(className);
        display.setAttribute("for",this.id);
        display.style.cssText = "position:relative;background:"+color+";";
        //input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "color";
        input.value = color;
        input.id = this.id;
        input.addEventListener("change",(event)=>{
            display.style.backgroundColor = event.target.value;
        });
        display.append(input);
        return display;
    }
}