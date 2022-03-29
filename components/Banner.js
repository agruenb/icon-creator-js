class Banner{
    element;
    constructor(content, closePhrase = "", actionOnClose = function(){}, ){
        this.element = document.createElement("div");
        this.element.classList.add("banner","box-shadow");
        let topWrapper = IconCreatorGlobal.el("div","","top-wrapper");
        topWrapper.append(content);
        this.element.append(topWrapper);
        if(closePhrase != ""){
            let closeButton = IconCreatorGlobal.el("button",closePhrase,"close-button");
            closeButton.setAttribute("selected","true");
            closeButton.addEventListener("click",()=>{
                actionOnClose();
                this.close();
            });
            topWrapper.append(closeButton);
        }
    }
    addTo(element){
        element.append(this.element);
    }
    close(){
        this.element.style.animationName = "slideUp";
        setTimeout(()=>{
            this.element.remove();
        },250);
    }
}