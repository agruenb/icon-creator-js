class PatternInfoBox{

    initialised = false;
    selected = false;

    previewWindow;
    
    fillColor;
    fillColorLabel;
    fillTrans;

    borderColor;
    borderColorLabel;
    borderWidth;
    borderWidthLabel;
    borderTrans;

    oneUpImg = "img/one_up_2.svg";
    toTopImg = "img/to_front.svg";
    oneDownImg = "img/one_down_2.svg";
    toBottomImg = "img/to_back.svg";

    seeThroughImg = "img/invisible.svg"

    constructor(pattern, keyFrame){
        this.pattern = pattern;
        this.keyFrame = keyFrame;
        this.boundId = pattern.id;
        this.element = document.createElement("div");
        this.element.id = "infoBox"+this.boundId;
        this.element.classList.add("infobox");
        this.name = this.pattern.constructor.name;
        this.fillBody();
        this.update();
    }
    update(){
        this.updatePreview();
        this.updateFill();
        this.updateBorder();
    }
    updatePreview(){
        this.previewWindow.innerHTML = `<svg viewbox='0 0 ${this.keyFrame.width} ${this.keyFrame.height}'>${this.pattern.cleanHTML()}</svg>`
    }
    updateAccentColor(){
        this.accentBackground.style.backgroundColor = this.fillColor.value;
    }
    updateFill(){
        if(this.pattern.color != undefined){
            if(this.fillColor.value != this.pattern.color && this.pattern.color != "transparent"){
                this.fillColor.value = this.pattern.color;
                this.fillColor.dispatchEvent(new Event('change'));
            }
            if(this.pattern.color != "transparent"){
                this.fillColorLabel.setAttribute("checked","true");
            }else{
                this.accentBackground.style.backgroundColor = "#ffffff";
                this.fillColorLabel.removeAttribute("checked");
            }
        }
    }
    updateBorder(){
        if(this.pattern.borderWidth != undefined){
            if(this.borderColor.value != this.pattern.borderColor && this.pattern.borderColor != "transparent"){
                this.borderColor.value = this.pattern.borderColor;
                this.borderColor.dispatchEvent(new Event('change'));
            }
            if(this.borderWidth.value != this.pattern.borderWidth && this.pattern.borderColor != "transparent"){
                this.borderWidth.value = this.pattern.borderWidth;
                this.borderWidth.dispatchEvent(new Event('change'));
            }
            if(this.pattern.borderColor != "transparent"){
                this.borderColorLabel.setAttribute("checked","true");
            }else{
                this.borderColorLabel.removeAttribute("checked");
            }
        }
    }
    getIconUrl(){
        switch (this.pattern.constructor.name) {
            case "Rect":
                return "img/rect_icon.svg";
            case "Circle":
                return "img/circle_icon.svg";
            case "Ellipse":
                return "img/ellipse_icon.svg";
            case "Line":
                return "img/line_icon.svg";
            case "Path":
                return "img/path_icon.svg";
            default:
                break;
        }
    }
    fillBody(){
        let headlineWrapper = IconCreatorGlobal.el("div","<img src='"+this.getIconUrl()+"'>"+this.name,"headline");

        let coloredBackground = document.createElement("div");
        this.accentBackground = coloredBackground;
        coloredBackground.classList.add("accent-background");
        coloredBackground.style.backgroundColor = this.pattern.color;

        let topWrapper = IconCreatorGlobal.el("div","", "top-wrapper");

        let preview = IconCreatorGlobal.el("div","", "preview");
        this.previewWindow = preview;
        let upperLine = IconCreatorGlobal.el("div","","line");
        upperLine.classList.add("upper");
        let line = IconCreatorGlobal.el("div","","line");
        line.classList.add("lower");
        //order
        let orderWrapper = IconCreatorGlobal.el("div","","order-wrapper");
        let toTop = IconCreatorGlobal.el("button","","toTop");
        let toTopIcon = document.createElement("img");
        toTopIcon.src = this.toTopImg;
        toTop.append(toTopIcon);
        let oneUp = IconCreatorGlobal.el("button","","oneUp");
        let oneUpIcon = document.createElement("img");
        oneUpIcon.src = this.oneUpImg;
        oneUp.append(oneUpIcon);
        let toBottom = IconCreatorGlobal.el("button","","toBottom");
        let toBottomIcon = document.createElement("img");
        toBottomIcon.src = this.toBottomImg;
        toBottom.append(toBottomIcon);
        let oneDown = IconCreatorGlobal.el("button","","oneDown");
        let oneDownIcon = document.createElement("img");
        oneDownIcon.src = this.oneDownImg;
        oneDown.append(oneDownIcon);
        orderWrapper.append(toTop, oneUp, oneDown, toBottom);
        //delete
        let deleteWrapper = IconCreatorGlobal.el("div","","delete-wrapper");
        let deleteButton = IconCreatorGlobal.el("button", "U", "delete-button");
        deleteButton.addEventListener("click",(e)=>{
            e.stopPropagation();
            this.keyFrame.editor.removePattern(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        deleteWrapper.append(deleteButton);
        upperLine.append(orderWrapper, deleteWrapper);
        //fill
        let colorWrapper = IconCreatorGlobal.el("div","","button-group");
        colorWrapper.classList.add("color-wrapper");
        if(this.pattern.color != undefined){
            let colorInput = new CustomColorInput("pseudo-input", (this.pattern.color == "transparent")?"#ffffff":this.pattern.color);
            this.fillColorLabel = colorInput;
            this.fillColor = colorInput.querySelector("input");
            let fillTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.color == "transparent", "");
            fillTransLabel.setAttribute("title","remove filling");
            fillTransLabel.classList.add("opacity_zero");
            this.fillTrans = fillTransLabel.querySelector("input");
            colorWrapper.append(colorInput, fillTransLabel);
            this.fillColor.addEventListener("change",(e)=>{
                this.keyFrame.alterPattern(this.pattern, {color:e.target.value}, true);
                this.updatePreview();
                this.updateAccentColor();
                this.keyFrame.editor.saveToHistory();
            });
            this.fillColor.addEventListener("click", ()=>{
                if(this.pattern.color === "transparent"){
                    this.fillTrans.checked = false;
                    this.fillTrans.dispatchEvent(new Event('change'));
                }
            });
            this.fillTrans.addEventListener("change",(e)=>{
                if(e.target.checked){//make content/fill transparent
                    this.keyFrame.alterPattern(this.pattern, {color:"transparent"}, true);
                    this.updatePreview();
                    this.keyFrame.editor.saveToHistory();
                }else{
                    this.keyFrame.alterPattern(this.pattern, {color:this.fillColor.value}, true);
                    this.updatePreview();
                    this.keyFrame.editor.saveToHistory();
                }
                this.updateFill();
            });
        }
        //border
        let borderWrapper = IconCreatorGlobal.el("div", "", "border-wrapper");
        borderWrapper.classList.add("button-group");
        if(this.pattern.borderWidth != undefined){
            let borderColorInput = new CustomColorInput("pseudo-input", (this.pattern.borderColor == "transparent")?"#ffffff":this.pattern.borderColor);
            this.borderColorLabel = borderColorInput;
            this.borderColor = borderColorInput.querySelector("input");
            let borderWidthInput = new CustomNumberInput("pseudo-input", this.pattern.borderWidth);
            this.borderWidth = borderWidthInput.querySelector("input");
            let borderTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.borderColor == "transparent", "");
            borderTransLabel.classList.add("opacity_zero");
            this.borderWidthLabel = borderWidthInput;
            borderTransLabel.setAttribute("title","remove border");
            this.borderTrans = borderTransLabel.querySelector("input");
            borderWrapper.append(borderColorInput, borderWidthInput, borderTransLabel);
            this.borderColor.addEventListener("change",(e)=>{
                this.keyFrame.alterPattern(this.pattern, {borderColor:e.target.value}, true);
                this.updatePreview();
                this.keyFrame.editor.saveToHistory();
            });
            this.borderColorLabel.addEventListener("click",(e)=>{
                if(this.pattern.borderColor === "transparent"){
                    this.borderTrans.checked = false;
                    this.borderTrans.dispatchEvent(new Event('change'));
                }
            });
            this.borderWidth.addEventListener("change",(e)=>{
                this.keyFrame.alterPattern(this.pattern, {borderWidth:e.target.value}, true);
                this.updatePreview();
                this.keyFrame.editor.saveToHistory();
            });
            this.borderWidthLabel.addEventListener("click",(e)=>{
                if(this.pattern.borderColor === "transparent"){
                    this.borderTrans.checked = false;
                    this.borderTrans.dispatchEvent(new Event('change'));
                }
            });
            this.borderTrans.addEventListener("change",(e)=>{
                if(e.target.checked){//make border transparent
                    this.keyFrame.alterPattern(this.pattern, {borderColor:"transparent"}, true);
                    this.updatePreview();
                    this.keyFrame.editor.saveToHistory();
                }else{
                    this.keyFrame.alterPattern(this.pattern, {borderColor:this.borderColor.value}, true);
                    this.updatePreview();
                    this.keyFrame.editor.saveToHistory();
                }
                this.updateBorder();
            });
        }
        line.append(colorWrapper, borderWrapper);

        topWrapper.append(preview, upperLine, line);

        this.element.append(coloredBackground, headlineWrapper, topWrapper);
        toBottom.addEventListener("click",(e)=>{
            this.keyFrame.editor.toBottom(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        toTop.addEventListener("click",(e)=>{
            this.keyFrame.editor.toTop(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        oneUp.addEventListener("click",(e)=>{
            this.keyFrame.editor.oneUp(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        oneDown.addEventListener("click",(e)=>{
            this.keyFrame.editor.oneDown(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        this.element.addEventListener("click", ()=>{
            this.keyFrame.editor.stopEdit();
            this.keyFrame.editor.startEdit(this.pattern);
        });
    }
    highlight(){
        this.element.classList.add("highlight");
        this.revealContent();
    }
    revealContent(){
        this.element.classList.add("expanded");
    }
    mute(){
        this.element.classList.remove("highlight");
        this.hideContent();
    }
    hideContent(){
        this.element.classList.remove("expanded");
    }
}