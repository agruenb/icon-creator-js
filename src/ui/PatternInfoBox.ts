import IconCreatorGlobal from "../IconCreatorGlobal";
import CustomColorInput from "./CustomColorInput";
import CustomCheckboxInput from "./CustomCheckboxInput";
import CustomNumberInput from "./CustomNumberInput";
import Frame from "../Frame";

export default class PatternInfoBox {
    initialised: boolean = false;
    selected: boolean = false;

    iconWrapper!: HTMLElement;

    fillColor!: HTMLInputElement;
    fillColorLabel!: HTMLLabelElement;
    fillTrans!: HTMLInputElement;

    borderColor!: HTMLInputElement;
    borderColorLabel!: HTMLLabelElement;
    borderWidth!: HTMLInputElement;
    borderWidthLabel!: HTMLLabelElement;
    borderTrans!: HTMLInputElement;
    displayedIcon!: HTMLImageElement;

    oneUpImg: string = "img/one_up_2.svg";
    toTopImg: string = "img/to_front.svg";
    oneDownImg: string = "img/one_down_2.svg";
    toBottomImg: string = "img/to_back.svg";

    seeThroughImg: string = "img/invisible.svg";

    VISIBLE: string = "img/eye.svg";
    HIDDEN: string = "img/eye_crossed.svg";

    pattern: any;
    keyFrame: Frame;
    boundId: string;
    element: HTMLDivElement;
    name: string;

    constructor(pattern: any, keyFrame: Frame) {
        this.pattern = pattern;
        this.keyFrame = keyFrame;
        this.boundId = pattern.id;
        this.element = document.createElement("div");
        this.element.id = "infoBox" + this.boundId;
        this.element.classList.add("infobox", "box-shadow");
        this.name = this.pattern.constructor.name;
        this.fillBody();
        this.update();
    }

    update(): void {
        this.updateIcon();
        this.updateFill();
        this.updateBorder();
        this.updateDisplayed();
    }

    updateIcon(): void {
        this.iconWrapper.innerHTML = `<svg viewbox='0 0 8 8'>${this.pattern.icon()}</svg>`;
    }

    updateFill(): void {
        if (this.pattern.color != undefined) {
            if (this.fillColor.value != this.pattern.color && this.pattern.color != "transparent") {
                this.fillColor.value = this.pattern.color;
                this.fillColor.dispatchEvent(new Event('change'));
            }
            if (this.pattern.color != "transparent") {
                this.fillColorLabel.setAttribute("checked", "true");
            } else {
                this.fillColorLabel.removeAttribute("checked");
            }
        }
    }

    updateBorder(): void {
        if (this.pattern.borderWidth != undefined) {
            if (this.borderColor.value != this.pattern.borderColor && this.pattern.borderColor != "transparent") {
                this.borderColor.value = this.pattern.borderColor;
                this.borderColor.dispatchEvent(new Event('change'));
            }
            if (this.borderWidth.value.toString() != this.pattern.borderWidth.toString() && this.pattern.borderColor != "transparent") {
                this.borderWidth.value = this.pattern.borderWidth;
                this.borderWidth.dispatchEvent(new Event('change'));
            }
            if (this.pattern.borderColor != "transparent") {
                this.borderColorLabel.setAttribute("checked", "true");
            } else {
                this.borderColorLabel.removeAttribute("checked");
            }
        }
    }

    updateDisplayed(): void {
        if (this.pattern.display) {
            this.displayedIcon.src = this.VISIBLE;
        } else {
            this.displayedIcon.src = this.HIDDEN;
        }
    }

    fillBody(): void {
        let topWrapper = IconCreatorGlobal.el("div", "", "top-wrapper");
        //icon
        let iconWrapper = IconCreatorGlobal.el("div", "", "shape-icon");
        this.iconWrapper = iconWrapper;
        let upperLine = IconCreatorGlobal.el("div", "", "line");
        upperLine.classList.add("upper");
        let line = IconCreatorGlobal.el("div", "", "line");
        line.classList.add("lower");
        //order
        let orderWrapper = IconCreatorGlobal.el("div", "", "order-wrapper");
        let toTop = IconCreatorGlobal.el("div", "", "toTop");
        toTop.classList.add("clickable");
        let toTopIcon = document.createElement("img");
        toTopIcon.src = this.toTopImg;
        toTop.append(toTopIcon);
        let oneUp = IconCreatorGlobal.el("div", "", "oneUp");
        oneUp.classList.add("clickable");
        let oneUpIcon = document.createElement("img");
        oneUpIcon.src = this.oneUpImg;
        oneUp.append(oneUpIcon);
        let toBottom = IconCreatorGlobal.el("div", "", "toBottom");
        toBottom.classList.add("clickable");
        let toBottomIcon = document.createElement("img");
        toBottomIcon.src = this.toTopImg;
        toBottomIcon.style.transform = "scale(-1, -1)";
        toBottom.append(toBottomIcon);
        let oneDown = IconCreatorGlobal.el("div", "", "oneDown");
        oneDown.classList.add("clickable");
        let oneDownIcon = document.createElement("img");
        oneDownIcon.src = this.oneUpImg;
        oneDownIcon.style.transform = "scale(-1, -1)";
        oneDown.append(oneDownIcon);
        orderWrapper.append(toTop, oneUp, oneDown, toBottom);
        //hide
        let hideWrapper = IconCreatorGlobal.el("div", "", "hide-wrapper");
        let hideButton = IconCreatorGlobal.el("div", "", "hide-button");
        hideButton.classList.add("clickable");
        let hideButtonImg = document.createElement("img");
        hideButtonImg.classList.add("hide-image");
        hideButtonImg.src = this.VISIBLE;
        this.displayedIcon = hideButtonImg;
        hideButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.pattern.display = !this.pattern.display;
            this.updateDisplayed();
            this.keyFrame.paint(this.pattern);
            this.keyFrame.editor.saveToHistory();
        });
        hideButton.append(hideButtonImg);
        hideWrapper.append(hideButton);
        upperLine.append(orderWrapper, hideWrapper);

        //fill
        let colorWrapper = IconCreatorGlobal.el("div", "", "color-wrapper");
        //icon
        let fillIcon = IconCreatorGlobal.el("div", "<img src='img/sys_bucket_icon.svg'>", "icon");
        //inputs
        let colorButtonGroup = IconCreatorGlobal.el("div", "", "button-group");
        if (this.pattern.color != undefined) {
            let colorInput = new CustomColorInput("pseudo-input", (this.pattern.color == "transparent") ? "#ffffff" : this.pattern.color) as any as HTMLLabelElement;
            this.fillColorLabel = colorInput;
            this.fillColor = colorInput.querySelector("input") as HTMLInputElement;
            let fillTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.color == "transparent", "") as any as HTMLLabelElement;
            fillTransLabel.setAttribute("title", "remove filling");
            fillTransLabel.classList.add("checkerboard-bg");
            this.fillTrans = fillTransLabel.querySelector("input") as HTMLInputElement;
            colorButtonGroup.append(colorInput, fillTransLabel);
            this.fillColor.addEventListener("change", (e: Event) => {
                this.keyFrame.alterPattern(this.pattern, { color: (e.target as HTMLInputElement).value }, true);
                this.updateIcon();
                this.keyFrame.editor.saveToHistory();
            });
            this.fillColor.addEventListener("click", () => {
                if (this.pattern.color === "transparent") {
                    this.fillTrans.checked = false;
                    this.fillTrans.dispatchEvent(new Event('change'));
                }
            });
            this.fillTrans.addEventListener("change", (e: Event) => {
                if ((e.target as HTMLInputElement).checked) {//make content/fill transparent
                    this.keyFrame.alterPattern(this.pattern, { color: "transparent" }, true);
                    this.updateIcon();
                    this.keyFrame.editor.saveToHistory();
                } else {
                    this.keyFrame.alterPattern(this.pattern, { color: this.fillColor.value }, true);
                    this.updateIcon();
                    this.keyFrame.editor.saveToHistory();
                }
                this.updateFill();
            });
        }
        colorWrapper.append(fillIcon, colorButtonGroup);
        //border
        let borderWrapper = IconCreatorGlobal.el("div", "", "border-wrapper");
        let borderIcon = IconCreatorGlobal.el("div", "<img src='img/sys_border_icon.svg'>", "icon");
        let borderButtonGroup = IconCreatorGlobal.el("div", "", "button-group");
        if (this.pattern.borderWidth != undefined) {
            let borderColorInput = new CustomColorInput("pseudo-input", (this.pattern.borderColor == "transparent") ? "#ffffff" : this.pattern.borderColor) as any as HTMLLabelElement;
            this.borderColorLabel = borderColorInput;
            this.borderColor = borderColorInput.querySelector("input") as HTMLInputElement;
            let borderWidthInput = new CustomNumberInput("pseudo-input", this.pattern.borderWidth) as any as HTMLLabelElement;
            this.borderWidth = borderWidthInput.querySelector("input") as HTMLInputElement;
            let borderTransLabel = new CustomCheckboxInput("pseudo-input", this.pattern.borderColor == "transparent", "") as any as HTMLLabelElement;
            borderTransLabel.classList.add("checkerboard-bg");
            this.borderWidthLabel = borderWidthInput;
            borderTransLabel.setAttribute("title", "remove border");
            this.borderTrans = borderTransLabel.querySelector("input") as HTMLInputElement;
            borderButtonGroup.append(borderColorInput, borderWidthInput, borderTransLabel);
            this.borderColor.addEventListener("change", (e: Event) => {
                this.keyFrame.alterPattern(this.pattern, { borderColor: (e.target as HTMLInputElement).value }, true);
                this.updateIcon();
                this.keyFrame.editor.saveToHistory();
            });
            this.borderColorLabel.addEventListener("click", () => {
                if (this.pattern.borderColor === "transparent") {
                    this.borderTrans.checked = false;
                    this.borderTrans.dispatchEvent(new Event('change'));
                }
            });
            this.borderWidth.addEventListener("change", (e: Event) => {
                this.keyFrame.alterPattern(this.pattern, { borderWidth: (e.target as HTMLInputElement).value }, true);
                this.updateIcon();
                this.keyFrame.editor.saveToHistory();
            });
            this.borderWidthLabel.addEventListener("click", () => {
                if (this.pattern.borderColor === "transparent") {
                    this.borderTrans.checked = false;
                    this.borderTrans.dispatchEvent(new Event('change'));
                }
            });
            this.borderTrans.addEventListener("change", (e: Event) => {
                if ((e.target as HTMLInputElement).checked) {//make border transparent
                    this.keyFrame.alterPattern(this.pattern, { borderColor: "transparent" }, true);
                    this.updateIcon();
                    this.keyFrame.editor.saveToHistory();
                } else {
                    this.keyFrame.alterPattern(this.pattern, { borderColor: this.borderColor.value }, true);
                    this.updateIcon();
                    this.keyFrame.editor.saveToHistory();
                }
                this.updateBorder();
            });
        }
        borderWrapper.append(borderIcon, borderButtonGroup);
        line.append(colorWrapper, borderWrapper);
        topWrapper.append(iconWrapper, upperLine, line);

        this.element.append(topWrapper);
        toBottom.addEventListener("click", (e) => {
            this.keyFrame.editor.toBottom(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        toTop.addEventListener("click", (e) => {
            this.keyFrame.editor.toTop(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        oneUp.addEventListener("click", (e) => {
            this.keyFrame.editor.oneUp(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        oneDown.addEventListener("click", (e) => {
            this.keyFrame.editor.oneDown(this.pattern);
            this.keyFrame.editor.saveToHistory();
            e.stopPropagation();
        });
        this.element.addEventListener("click", () => {
            this.keyFrame.editor.stopEdit();
            this.keyFrame.editor.startEdit(this.pattern);
        });
    }

    highlight(): void {
        this.element.classList.add("highlight");
        this.revealContent();
    }

    revealContent(): void {
        this.element.classList.add("expanded");
    }

    mute(): void {
        this.element.classList.remove("highlight");
        this.hideContent();
    }

    hideContent(): void {
        this.element.classList.remove("expanded");
    }
}
