import IconCreatorGlobal from "../IconCreatorGlobal";

export default class CustomColorInput{
    constructor(className:string | Array<string>, color:string){
        const id = IconCreatorGlobal.id();
        //display
        let display = document.createElement("label");
        if(Array.isArray(className)){
            display.classList.add(...className)
        }else{
            display.classList.add(className)
        }
        display.setAttribute("for",id);
        display.style.cssText = "position:relative;background:"+color+";";
        //input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "color";
        input.value = color;
        input.id = id;
        input.addEventListener("change",(event)=>{
            display.style.backgroundColor = (event.currentTarget as HTMLInputElement).value;
        });
        display.append(input);
        Object.assign(display, this);
        return display;
    }
}