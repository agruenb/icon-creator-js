class CustomCheckboxInput extends IconCreatorGlobal{

    constructor(className = "", value, content = ""){
        super();
        let display = document.createElement("label");
        display.classList.add(className);
        display.setAttribute("for",this.id);
        display.style.cssText = "position:relative;";
        display.innerHTML = "<div>"+content+"</div>";
        //input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "checkbox";
        input.checked = value;
        input.id = this.id;
        input.addEventListener("change",(event)=>{
            if(event.target.checked){
                display.setAttribute("checked","true");
            }else{
                display.removeAttribute("checked");
            }
        });
        if(value){
            display.setAttribute("checked","true");
        }else{
            display.removeAttribute("checked");
        }
        display.append(input);
        return display;
    }
}