class ContextMenu{
    
    container = document.createElement("div");

    parentContainer;
    /**
     * z-index:0-9999 patterns
     * 10000 viewport outline
     * 10001 context menu
     * @param {*} x 
     * @param {*} y 
     * @param {*} parentContainer 
     */
    constructor(x,y,parentContainer){
        this.container.style.cssText=`position:absolute;top:${y}px;left:${x}px;z-index:10001;`;
        this.container.classList.add("context-container");
        this.parentContainer = parentContainer;
    }

    deploy(options){
        for(let i = 0;i < options.length; i++){
            let button = new EditorButton(options[i].label, options[i].icon, options[i].clickHandler);
            button.addTo(this.container);
        }
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