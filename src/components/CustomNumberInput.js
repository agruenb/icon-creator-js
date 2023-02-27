import IconCreatorGlobal from "../IconCreatorGlobal";

export default class CustomNumberInput extends IconCreatorGlobal{
    constructor(className, pValue){
        super();
        //display
        let display = document.createElement("label");
        display.classList.add(className, "custom-component","number-input");
        display.setAttribute("for",this.id);
        display.style.cssText = "position:relative;display:flex;justify-content:center;align-items:center;background:#fff;";
        //value
        let value = document.createElement("div");
        value.innerHTML = pValue;
        //input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "number";
        input.setAttribute("min","0");
        input.id = this.id;
        input.value = pValue;
        input.addEventListener("change",(event)=>{
            value.innerHTML = event.target.value;
        });
        //hover buttons
        let up = document.createElement("div");
        up.classList.add("adjust-up","adjust");
        up.addEventListener("click",(event)=>{
            input.value = parseInt(input.value) + 1;
            input.dispatchEvent(new Event('change'));
        });
        let down = document.createElement("div");
        down.classList.add("adjust-down","adjust");
        down.addEventListener("click",(event)=>{
            input.value = parseInt(input.value) - 1;
            input.dispatchEvent(new Event('change'));
        });
        display.append(value);
        display.append(up, down);
        display.append(input);
        return display;
    }
}