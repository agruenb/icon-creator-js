class CustomNumberInput extends IconCreatorGlobal{
    constructor(className, pValue){
        super();
        //display
        let display = document.createElement("label");
        display.classList.add(className);
        display.setAttribute("for",this.id);
        display.style.cssText = "position:relative;display:flex;justify-content:center;align-items:center;";
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
        up.innerHTML = "^";
        up.style.cssText = "position:absolute;height:50%;width:100%;top:0;left:0;justify-content:center;align-items:center;display:none;user-select:none;";
        up.addEventListener("click",(event)=>{
            input.value = parseInt(input.value) + 1;
            input.dispatchEvent(new Event('change'));
        });
        let down = document.createElement("div");
        down.innerHTML = "v";
        down.style.cssText = "position:absolute;height:50%;width:100%;top:50%;left:0;justify-content:center;align-items:center;display:none;user-select:none;";
        down.addEventListener("click",(event)=>{
            input.value = parseInt(input.value) - 1;
            input.dispatchEvent(new Event('change'));
        });
        display.addEventListener("mouseenter",()=>{
            up.style.display = "flex";
            down.style.display = "flex";
        });
        display.addEventListener("mouseleave",()=>{
            up.style.display = "none";
            down.style.display = "none";
        });
        display.append(value);
        display.append(up, down);
        display.append(input);
        return display;
    }
}