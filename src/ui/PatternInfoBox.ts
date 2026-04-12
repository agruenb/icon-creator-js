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
    handleDotsImg: string = "img/handle_dots.svg";

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
        this.iconWrapper.innerHTML = `<svg viewBox='0 0 8 8' width='100%' height='100%'>${this.pattern.icon()}</svg>`;
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
            this.displayedIcon.style.filter = "";
        } else {
            this.displayedIcon.src = this.HIDDEN;
            this.displayedIcon.style.filter = "invert(24%) sepia(90%) saturate(6246%) hue-rotate(349deg) brightness(98%) contrast(96%)";
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
        // drag handle
        let dragHandle = IconCreatorGlobal.el("div", "", "drag-handle");
        let handleImg = document.createElement("img");
        handleImg.src = this.handleDotsImg;
        handleImg.style.width = "16px";
        handleImg.style.height = "auto";
        dragHandle.append(handleImg);
        dragHandle.style.cursor = "grab";
        dragHandle.style.display = "flex";
        dragHandle.style.alignItems = "center";
        dragHandle.style.paddingRight = "8px";

        let state = { startY: 0 };

        const onMouseMove = (e: MouseEvent) => {
            let deltaY = e.clientY - state.startY;

            if (this.element.parentElement) {
                const siblings = [...this.element.parentElement.children] as HTMLElement[];
                const currentIndex = siblings.indexOf(this.element);

                // Bounds checking
                if (currentIndex === 0 && deltaY < 0) deltaY = 0;
                if (currentIndex === siblings.length - 1 && deltaY > 0) deltaY = 0;

                this.element.style.transform = `translateY(${deltaY}px)`;

                if (deltaY < -this.element.offsetHeight / 2 && currentIndex > 0) {
                    const prev = siblings[currentIndex - 1];
                    this.element.parentElement.insertBefore(this.element, prev);
                    state.startY -= prev.offsetHeight;
                    this.element.style.transform = `translateY(${e.clientY - state.startY}px)`;
                } else if (deltaY > this.element.offsetHeight / 2 && currentIndex < siblings.length - 1) {
                    const next = siblings[currentIndex + 1];
                    this.element.parentElement.insertBefore(next, this.element);
                    state.startY += next.offsetHeight;
                    this.element.style.transform = `translateY(${e.clientY - state.startY}px)`;
                }
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "";
            dragHandle.style.cursor = "grab";
            this.element.classList.remove("dragging");
            this.element.style.transform = "";
            this.element.style.zIndex = "";
            this.element.style.position = "";

            if (typeof this.keyFrame !== 'boolean' && this.keyFrame) {
                const frame = this.keyFrame as Frame;
                if (this.element.parentElement) {
                    const newRenderOrder = [...this.element.parentElement.children]
                        .map(child => child.id.replace("infoBox", ""))
                        .reverse();

                    let changed = false;
                    for (let i = 0; i < newRenderOrder.length; i++) {
                        if (newRenderOrder[i] !== frame.renderOrder[i]) {
                            changed = true;
                            break;
                        }
                    }
                    if (changed) {
                        frame.renderOrder = newRenderOrder;
                        frame.editor.repaint();
                        frame.editor.saveToHistory();
                    }
                }
            }
        };

        dragHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.element.classList.add("dragging");
            this.element.style.zIndex = "100";
            this.element.style.position = "relative";
            state.startY = e.clientY;
            document.body.style.cursor = "grabbing";
            dragHandle.style.cursor = "grabbing";
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
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
        hideWrapper.style.marginLeft = "auto";
        //name
        let patternTag = IconCreatorGlobal.el("div", "", "pattern-tag");
        patternTag.innerText = this.pattern.displayName;
        upperLine.append(dragHandle, iconWrapper, patternTag, hideWrapper);

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
        topWrapper.append(upperLine, line);

        this.element.append(topWrapper);
        // Old button handlers removed
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
