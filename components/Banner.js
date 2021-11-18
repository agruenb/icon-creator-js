class Banner{
    constructor(title = "Hello World",closePhrase = "Close", actionOnClose = function(){}, text = ""){
        let element = document.createElement("div");
        element.classList.add("banner");
        let topWrapper = IconCreatorGlobal.el("div","","top-wrapper");
        let headline = IconCreatorGlobal.el("div",title,"title");
        let closeButton = IconCreatorGlobal.el("button",closePhrase,"close-button");
        topWrapper.append(headline, closeButton);
        let bottomWrapper = IconCreatorGlobal.el("div","","bottom-wrapper");
        element.append(topWrapper, bottomWrapper);

        closeButton.addEventListener("click",()=>{
            actionOnClose();
            element.style.animationName = "slideUp";
            setTimeout(()=>{
                element.remove();
            },250);
        });
        return element;
    }
}