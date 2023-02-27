export default class ContextMenu{
    
    container = document.createElement("div");

    parentContainer;
    /**
     * @param {*} x 
     * @param {*} y 
     * @param {*} parentContainer 
     */
    constructor(x,y,parentContainer){
        this.container.style.cssText=`position:absolute;top:${y}px;left:${x}px;z-index:10001;`;
        this.container.classList.add("context-container","box-shadow");
        this.parentContainer = parentContainer;
    }

    deploy(options){
        let customButtonWrapper = document.createElement("div");
        customButtonWrapper.classList.add("custom-options");
        let generalButtonWrapper = document.createElement("div");
        generalButtonWrapper.classList.add("general-options");
        for(let i = 0;i < options.length; i++){
            let button = new MenuButton(options[i].label, options[i].icon, options[i].transform, options[i].clickHandler);
            if(options[i].type == "custom"){
                button.addTo(customButtonWrapper);
            }else{
                button.addTo(generalButtonWrapper);
            }
        }
        this.container.append(customButtonWrapper, generalButtonWrapper);
        this.parentContainer.append(this.container);
    }
    setPosition(left, top){
        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
    }
    close(){
        this.container.remove();
    }
}