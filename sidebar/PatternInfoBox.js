class PatternInfoBox{

    initialised = false;

    previewWindow;
    
    fillColor;
    fillColorLabel;
    fillTrans;

    borderColor;
    borderColorLabel;
    borderWidth;
    borderWidthLabel;
    borderTrans;

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
    updateFill(){
        if(this.pattern.color != undefined){
            if(this.fillColor.value != this.pattern.color && this.pattern.color != "transparent"){
                this.fillColor.value = this.pattern.color;
                this.fillColor.dispatchEvent(new Event('change'));
            }
            if(this.pattern.color != "transparent"){
                this.fillColorLabel.setAttribute("checked","true");
            }else{
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
                this.borderWidthLabel.setAttribute("checked","true");
            }else{
                this.borderColorLabel.removeAttribute("checked");
                this.borderWidthLabel.removeAttribute("checked");
            }
        }
    }
    fillBody(){
        let headline = this.el("div",this.name,"headline");

        let topWrapper = this.el("div","", "top-wrapper");

        let preview = this.el("div","", "preview");
        this.previewWindow = preview;
        let line = this.el("div","","line");
        //order
        let orderWrapper = this.el("div","","order-wrapper");
        orderWrapper.classList.add("line");
        let orderLabel = this.el("div","Anordnen","discr");
        let toTop = this.el("button","A","toTop");
        let oneUp = this.el("button","^","oneUp");
        let toBottom = this.el("button","V","toBottom");
        let oneDown = this.el("button","v","oneDown");
        orderWrapper.append(orderLabel, toTop, oneUp, toBottom, oneDown);
        //fill
        let colorWrapper = this.el("div","","color-wrapper");
        if(this.pattern.color != undefined){
            let colorLabel = this.el("div","Füllen","discr");
            let colorInput = new CustomColorInput("pseudo-input", (this.pattern.color == "transparent")?"#ffffff":this.pattern.color);
            this.fillColorLabel = colorInput;
            this.fillColor = colorInput.querySelector("input");
            let fillTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.color == "transparent", "X");
            fillTransLabel.setAttribute("title","remove filling");
            this.fillTrans = fillTransLabel.querySelector("input");
            colorWrapper.append(colorLabel, colorInput, fillTransLabel);
            this.fillColor.addEventListener("change",(e)=>{
                this.keyFrame.alterPattern(this.pattern, {color:e.target.value}, true);
                this.updatePreview();
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
        let borderWrapper = this.el("div", "", "border-wrapper");
        if(this.pattern.borderWidth != undefined){
            let borderColorLabel = this.el("div","Rahmen","discr");
            let borderColorInput = new CustomColorInput("pseudo-input", (this.pattern.borderColor == "transparent")?"#ffffff":this.pattern.borderColor);
            this.borderColorLabel = borderColorInput;
            this.borderColor = borderColorInput.querySelector("input");
            let borderWidthInput = new CustomNumberInput("pseudo-input", this.pattern.borderWidth);
            this.borderWidth = borderWidthInput.querySelector("input");
            let borderTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.borderColor == "transparent", "X");
            this.borderWidthLabel = borderWidthInput;
            borderTransLabel.setAttribute("title","remove border");
            this.borderTrans = borderTransLabel.querySelector("input");
            borderWrapper.append(borderColorLabel, borderColorInput, borderWidthInput, borderTransLabel);
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

        topWrapper.append(preview, orderWrapper, line);

        let deleteButton = this.el("div", "U", "delete-button");
        this.element.append(deleteButton);

        this.element.append(headline, topWrapper);
        toBottom.addEventListener("click",()=>{
            this.keyFrame.editor.toBottom(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        toTop.addEventListener("click",()=>{
            this.keyFrame.editor.toTop(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        oneUp.addEventListener("click",()=>{
            this.keyFrame.editor.oneUp(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        oneDown.addEventListener("click",()=>{
            this.keyFrame.editor.oneDown(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        deleteButton.addEventListener("click",(e)=>{
            e.stopPropagation();
            this.keyFrame.editor.removePattern(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        this.element.addEventListener("click", ()=>{
            this.keyFrame.editor.stopEdit();
            this.keyFrame.editor.startEdit(this.pattern);
        });
    }
    el(type,text,className){
        let el = document.createElement(type);
        el.classList.add(className);
        el.innerHTML = text;
        return el;
    }
    highlight(){
        this.element.classList.add("highlight");
    }
    mute(){
        this.element.classList.remove("highlight");
    }
}