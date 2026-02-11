import IconCreatorGlobal from "./IconCreatorGlobal";
import ColorMachine from "./components/ColorMachine";
import Frame from "./Frame";
import MaskFrame from "./MaskFrame";
import ImageProcessor from "./shared/imageProcessor";

import ReferenceImage from "./patterns/ReferenceImage";

export default class Project extends IconCreatorGlobal {

    editor: any;

    infoBoxContainer: HTMLElement;
    container: HTMLElement;
    frameContainer: HTMLElement;
    viewportOutline: HTMLElement;
    dimensions: { width: string, height: string };

    initialized: boolean = false;
    generateColors: boolean = true;
    colorMachine: ColorMachine = new ColorMachine("pastel");
    paintColor: string = "default";
    bgType: string = "lines";
    bgGridsize: number = 1;

    keyframes: Frame[] = new Array();

    currentFrame: Frame;
    bgCanvas: HTMLCanvasElement;
    fullViewport: HTMLElement;
    outlineThiccness: number = 2;
    referenceFrame: any;
    referenceFrameContainer: HTMLElement;

    constructor(infoBoxContainer: HTMLElement, editor: any) {
        super();
        this.editor = editor;
        this.infoBoxContainer = infoBoxContainer;
        this.dimensions = {
            width: "512",
            height: "512"
        }
    }
    init(fullViewport: HTMLElement) {
        this.initialized = true;
        this.container = document.createElement("div");
        this.container.style.cssText = "display:grid";
        this.container.id = "id" + IconCreatorGlobal.id();

        this.frameContainer = document.createElement("div");
        this.frameContainer.style.cssText = "height:" + this.dimensions.height + "px;width:" + this.dimensions.width + "px;";

        this.viewportOutline = document.createElement("div");
        this.outlineThiccness = 2;
        this.viewportOutline.style.cssText = `pointer-events:none;height:${this.dimensions.height}px;width:${this.dimensions.width}px;border-radius:2px;z-index:10000;transform:translate(-${this.outlineThiccness}px, -${this.outlineThiccness}px);`;

        let firstFrame = new Frame(this.frameContainer, this.infoBoxContainer, this.editor);
        firstFrame.paintPanel.style.display = "block";
        this.keyframes.push(firstFrame);
        this.currentFrame = this.keyframes[0];

        this.bgCanvas = document.createElement("canvas");
        this.bgCanvas.style.cssText = "position:absolute;top:0;left:0;height:100vh;width:100vw;";

        this.container.append(this.frameContainer);
        this.container.append(this.bgCanvas);
        this.container.append(this.viewportOutline);
        //configure canvas after viewport size
        this.fullViewport = fullViewport;
        this.drawBg();

        //setup css inside head
        let css = `#${this.container.id} > div{grid-column: 1;grid-row: 1;}`;
        let head = document.head || document.getElementsByTagName('head')[0];
        let style = document.createElement('style');
        head.appendChild(style);
        (style as any).type = 'text/css';
        style.appendChild(document.createTextNode(css));
        //paintColor
        let colorInput = this.editor.environment.control.meta.paintColor.querySelector("input");
        if (colorInput) {
            colorInput.value = this.colorMachine.pallet()[0];
            colorInput.dispatchEvent(new Event('change'));
        }
        this.colorMachine.next();
    }
    frame() {
        return this.currentFrame;
    }
    /**
     * Changes the visible frame and paints the ui.
     * @param {Frame} frame 
     */
    setFrame(frame: Frame) {
        this.currentFrame.hide();
        this.currentFrame = frame;
        this.currentFrame.show();
        this.repaint();
    }
    /**
     * Switch displayed frame to mask of pattern
     */
    switchToMask(pattern: any) {
        //create new mask frame
        let maskFrame = new MaskFrame(this.frameContainer, this.infoBoxContainer, this.editor);
        maskFrame.boundId = pattern.id;
        //add mask layer if not there yet
        if (!pattern.maskLayer) {
            pattern.maskLayer = {
                patterns: []
            }
        }
        maskFrame.append(pattern);
        //add all masking patterns of pattern
        for (let pos in pattern.maskLayer.patterns) {
            maskFrame.append(pattern.maskLayer.patterns[pos]);
        }
        this.setFrame(maskFrame);
    }
    addReferenceImage(image: any) {
        let url = URL.createObjectURL(image);
        if (this.referenceFrame == undefined) {
            this.initRefFrame();
        }
        let callback = (width: number, height: number) => {
            this.referenceFrame.processAndAppend(new ReferenceImage(0, 0, 100 * width / height, 100, url, width / height));
            this.referenceFrame.show();
            this.referenceFrame.repaint();
        }
        ImageProcessor.imageDimensions(image, callback);
    }
    initRefFrame() {
        this.referenceFrameContainer = document.createElement("div");
        this.referenceFrameContainer.style.cssText = "height:" + this.dimensions.height + "px;width:" + this.dimensions.width + "px;";
        this.referenceFrameContainer.classList.add("ref-frame-container");
        this.referenceFrame = new Frame(this.referenceFrameContainer, document.createElement("div"), this.editor);
        this.referenceFrame.role = "reference";
        this.container.prepend(this.referenceFrameContainer);
    }
    newPattern(type: string, xOrigin: number, yOrigin: number) {
        return this.frame().newPattern(type, xOrigin, yOrigin, this.getColor());
    }
    getColor() {
        let color;
        if (this.paintColor == "default" && this.generateColors) {
            let colorInput = this.editor.environment.control.meta.paintColor.querySelector("input");
            color = colorInput ? colorInput.value : "#000000";
            let newColor = this.colorMachine.next();
            if (colorInput) {
                colorInput.value = newColor;
                colorInput.dispatchEvent(new Event('change'));
            }
        } else {
            color = this.paintColor;
        }
        return color;
    }
    setColor(color: string = "#000000") {
        this.paintColor = color;
        let colorInput = this.editor.environment.control.meta.paintColor.querySelector("input");
        if (colorInput && colorInput.value != color) {
            colorInput.value = color;
            colorInput.dispatchEvent(new Event('change'));
        }
    }
    patternById(id: string) {
        let pattern = this.frame().patternById(id);
        if (pattern == undefined && this.referenceFrame) {//if not in focussed frame it could be a refernce image
            pattern = this.referenceFrame.patternById(id);
        }
        return pattern;
    }
    /**
     * Calls the alterPattern function of the active Frame. Passed attributes in attrObject are adjusted in pattern. Use this function to alter Patterns, because is also adjusts the mask.
     * @param {Pattern} pattern pattern that should be altered
     * @param {Object} attrObject object containing the changes
     * @param {Boolean} repaint default true; repaint the frame after altering
     */
    alterPattern(pattern: any, attrObject: any, repaint: boolean = true) {
        if (pattern && pattern.isReference) {
            this.referenceFrame.alterPattern(pattern, attrObject, repaint);
        } else {
            this.frame().alterPattern(pattern, attrObject, repaint);
        }
    }
    repaint(pattern?: any) {
        if (pattern && pattern.isReference) {
            this.referenceFrame.paint(pattern);
        } else {
            this.frame().paint(pattern);
        }
    }
    remove(pattern: any) {
        if (pattern && pattern.isReference) {
            this.referenceFrame.remove(pattern);
        } else {
            this.frame().remove(pattern);
        }
    }
    reset() {
        this.currentFrame.hide();
        let newFrame = new Frame(this.frameContainer, this.infoBoxContainer, this.editor);
        newFrame.paintPanel.style.display = "block";
        this.keyframes = [];
        this.keyframes.push(newFrame);
        this.currentFrame = this.keyframes[0];
    }
    toTop(pattern: any) {
        this.frame().toTop(pattern);
    }
    toBottom(pattern: any) {
        this.frame().toBottom(pattern);
    }
    oneUp(pattern: any) {
        this.frame().oneUp(pattern);
    }
    oneDown(pattern: any) {
        this.frame().oneDown(pattern);
    }
    drawBg() {
        let lightLinesLightBg = "#eaeaea";
        let strongLinesLightBg = "#cecece";
        let viewportDomBox = this.fullViewport.getBoundingClientRect();
        this.bgCanvas.setAttribute("width", viewportDomBox.width + "px");
        this.bgCanvas.setAttribute("height", viewportDomBox.height + "px");
        let highlightInterval = 4;
        let schemeColor = (this.editor.colorSchemeLight) ? "#1a1a1a" : "#dbdbdb"
        //border
        this.viewportOutline.style.border = `${this.outlineThiccness}px solid ${schemeColor}`;
        //inner drawing
        let pen = this.bgCanvas.getContext("2d");
        if (pen) {
            pen.clearRect(0, 0, viewportDomBox.width, viewportDomBox.height);
            if (this.bgGridsize > 8) {//only render if grid not too fine
                //offset to align with drawingViewport
                let offsetX = Math.trunc(((viewportDomBox.width - Math.trunc(parseFloat(this.dimensions.width))) / 2) % (this.bgGridsize * highlightInterval));
                let offsetY = Math.trunc(((viewportDomBox.height - Math.trunc(parseFloat(this.dimensions.height))) / 2) % (this.bgGridsize * highlightInterval));
                //move back lines to start at viewport start even with offset
                let iterationOffsetX = Math.round(offsetX / this.bgGridsize);
                let iterationOffsetY = Math.round(offsetY / this.bgGridsize);
                switch (this.bgType) {
                    case "dotts":
                        let dottAmountX = Math.trunc(Math.trunc(parseFloat(this.dimensions.width)) / this.bgGridsize);
                        let dottAmountY = Math.trunc(Math.trunc(parseFloat(this.dimensions.height)) / this.bgGridsize);
                        pen.fillStyle = pen.strokeStyle = schemeColor;
                        for (let x = 1; x < dottAmountX; x++) {
                            for (let y = 1; y < dottAmountY; y++) {
                                //every 5th point red cross
                                if (x % highlightInterval === 0 && y % highlightInterval === 0) {
                                    pen.beginPath();
                                    pen.arc(x * this.bgGridsize - 0.5, y * this.bgGridsize - 0.5, 2, 0, Math.PI * 2);
                                    pen.fill();
                                } else {
                                    pen.fillRect(x * this.bgGridsize - 0.5, y * this.bgGridsize - 0.5, 1, 1);
                                }
                            }
                        }
                        break;
                    case "lines":
                        let lineAmountX = Math.trunc(Math.trunc(viewportDomBox.width) / this.bgGridsize);
                        let lineAmountY = Math.trunc(Math.trunc(viewportDomBox.height) / this.bgGridsize);
                        pen.lineWidth = 1.5;
                        for (let x = 1 - iterationOffsetX; x < lineAmountX; x++) {
                            pen.beginPath();
                            if (x % highlightInterval == 0) {
                                pen.strokeStyle = strongLinesLightBg;
                            } else {
                                pen.strokeStyle = lightLinesLightBg;
                            }
                            pen.moveTo((this.bgGridsize * x) + 0.75 + offsetX, 0);
                            pen.lineTo((this.bgGridsize * x) + 0.75 + offsetX, viewportDomBox.height);
                            pen.stroke();
                            pen.closePath();
                        }
                        for (let y = 1 - iterationOffsetY; y < lineAmountY; y++) {
                            pen.beginPath();
                            if (y % highlightInterval == 0) {
                                pen.strokeStyle = strongLinesLightBg;
                            } else {
                                pen.strokeStyle = lightLinesLightBg;
                            }
                            pen.moveTo(0, (y * this.bgGridsize) + 0.5 + offsetY);
                            pen.lineTo(viewportDomBox.width, (y * this.bgGridsize) + 0.5 + offsetY);
                            pen.stroke();
                            pen.closePath();
                        }
                        break;
                    default:
                        console.warn(this.bgType);
                        break;
                }
            }
        }
    }
    /**
     * Loads a project and its frames + patterns that hast been exported with project.get(). Note that the current project will be overwritten.
     * @param {JSON} projectJSON a JSON Object that will be loaded
     */
    load(projectJSON: any = {}) {
        //check valid
        if (projectJSON.version != this.version) {
            console.warn("Loading project from another version");
        }
        if (projectJSON.type != "project") {
            console.error("Project cannot load save of type " + projectJSON.type);
            return;
        }
        this.id = projectJSON.attributes.id;
        //clear
        for (let index in this.keyframes) {
            this.keyframes[index].delete();
        }
        this.keyframes = [];
        //load
        for (let index in projectJSON.attributes.keyframes) {
            let frame = new Frame(this.frameContainer, this.infoBoxContainer, this.editor);
            frame.load(projectJSON.attributes.keyframes[index]);
            this.keyframes.push(frame);
        }
        this.setFrame(this.keyframes[0]);
    }
    /**
     * Returns the JSON representation of this project.
     */
    get() {
        let passKeyframes = [];
        for (let index in this.keyframes) {
            passKeyframes.push(this.keyframes[index].get());
        }
        let obj = super.get();
        Object.assign(obj,
            {
                type: "project",
                attributes: {
                    initialized: this.initialized,
                    id: this.id,
                    keyframes: passKeyframes
                }
            });
        return this.copy(obj);
    }
}