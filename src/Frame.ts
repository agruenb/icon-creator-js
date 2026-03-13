import IconCreatorGlobal from "./IconCreatorGlobal";
import ActionHistory from "./actionHistory";
import InfoBoxManager from "./ui/InfoBoxManager";
import PatternRegistry from "./shared/PatternRegistry";
import TouchInputAdapter from "./shared/TouchInputAdapter";

export default class Frame extends IconCreatorGlobal {

    history: ActionHistory = new ActionHistory(this);
    opacity: number = 1;

    role: string = "main";
    boundId: string | undefined;

    paintPanel: HTMLElement = document.createElement("div");
    uiLayer: HTMLElement = document.createElement("div");

    patterns: { [key: string]: any } = new Object();
    renderOrder: string[] = new Array();

    markers: any[] = new Array();
    focusedPattern: any;

    isMaskFrame: boolean = false;

    width: number = 512;
    height: number = 512;
    infoBoxContainer: HTMLElement | undefined;
    parentElement: HTMLElement;
    editor: any;
    infoBoxManager!: InfoBoxManager;

    constructor(parentElement: HTMLElement, infoBoxContainer: HTMLElement | undefined, editor: any) {
        super();
        this.infoBoxContainer = infoBoxContainer;
        this.parentElement = parentElement;
        this.editor = editor;

        this.paintPanel.style.cssText = "width:" + parentElement.style.width + ";height:" + parentElement.style.height + ";";
        this.paintPanel.style.display = "none";
        this.paintPanel.setAttribute("frameId", this.id);
        this.paintPanel.classList.add("paint-panel");
        parentElement.append(this.paintPanel);
        this.uiLayer.setAttribute("el-type", "uiLayer");
        //z-index is also rel to elements so if there are more than 9999 elements, thw ui is behind them
        this.uiLayer.style.cssText = "position:absolute;overflow:hidden;z-index:9999;pointer-events:none;height:100%;width:100%;top:0;left:0;";

        parentElement.append(this.uiLayer);
        if (infoBoxContainer != undefined) {
            this.infoBoxManager = new InfoBoxManager(infoBoxContainer, this);
        } else {
            this.infoBoxManager = new InfoBoxManager(undefined, true as any);
        }
        this.history.add(this.get());
        console.log("Frame created");
    }
    append(patternObj: any) {
        let id = patternObj.id;
        this.patterns[id] = patternObj;
        this.renderOrder.push(String(id));
    }
    remove(pattern: any, repaint: boolean = true) {
        delete this.patterns[pattern.id];
        this.renderOrder.splice(this.renderOrder.indexOf(pattern.id), 1);
        this.infoBoxManager.remove(pattern);
        if (repaint) {
            this.repaint();
        }
    }
    processAndAppend(rawPattern: any) {
        this.append(rawPattern);
    }
    newPattern(type: string, xOrigin: number, yOrigin: number, color: string = "#ffee00") {
        //this object is the main pattern object for dragging ect.
        let pattern = this.basicPattern(type, xOrigin, yOrigin, color);
        this.append(pattern);
        this.repaint();
        return pattern;
    }
    newBox(pattern: any) {
        this.infoBoxManager.newBox(pattern);
    }
    updateInfoBox(pattern?: any) {
        this.infoBoxManager.updateBox(pattern);
    }
    hide() {
        this.paintPanel.innerHTML = "";
        this.paintPanel.style.display = "none";
        this.infoBoxManager.hide();
    }
    show() {
        this.paintPanel.style.display = "block";
        this.infoBoxManager.show();
    }
    basicPattern(type: string, xOrigin: number, yOrigin: number, color: string) {
        let PatternClass = PatternRegistry.getClass(type);
        if (!PatternClass) {
            console.error("Pattern class not found for " + type);
            return null;
        }
        let pattern;
        switch (type) {
            case "Rect":
                pattern = new PatternClass(xOrigin, yOrigin, 2, 2, color);
                break;
            case "Circle":
                pattern = new PatternClass(xOrigin, yOrigin, 2, color);
                break;
            case "Ellipse":
                pattern = new PatternClass(xOrigin, yOrigin, 2, 2, color);
                break;
            case "Line":
                pattern = new PatternClass(xOrigin, yOrigin, xOrigin, yOrigin, color);
                break;
            case "Path":
                pattern = new PatternClass(xOrigin, yOrigin, new Array(), color);
                break;
            default:
                break;
        }
        return pattern;
    }
    patternById(id: string) {
        return this.patterns[id];
    }
    ids() {
        return Object.keys(this.patterns);
    }
    clearUI() {
        this.markers = new Array();
        this.uiLayer.innerHTML = "";
    }
    focus(pattern: any) {
        if (pattern != undefined) {
            this.focusedPattern = pattern;
        } else {
            this.focusedPattern = undefined;
        }
    }
    setOpacity(value: number) {
        this.opacity = value;
    }
    stopEdit() {
        this.focus(undefined);
        this.infoBoxManager.muteAll();
        this.clearUI();
    }
    toTop(pattern: any = {}) {
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if (indexOfId != this.renderOrder.length - 1) {
            this.renderOrder.splice(indexOfId, 1);
            this.renderOrder.push(pattern.id);
            this.repaint();
        }
    }
    toBottom(pattern: any = {}) {
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if (indexOfId != 0) {
            this.renderOrder.splice(indexOfId, 1);
            this.renderOrder.unshift(pattern.id);
            this.repaint();
        }
    }
    oneUp(pattern: any = {}) {
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if (indexOfId !== this.renderOrder.length - 1) {
            [this.renderOrder[indexOfId], this.renderOrder[indexOfId + 1]] = [this.renderOrder[indexOfId + 1], this.renderOrder[indexOfId]];
            this.repaint();
        }
    }
    oneDown(pattern: any = {}) {
        let indexOfId = this.renderOrder.indexOf(String(pattern.id));
        if (indexOfId !== 0) {
            [this.renderOrder[indexOfId], this.renderOrder[indexOfId - 1]] = [this.renderOrder[indexOfId - 1], this.renderOrder[indexOfId]];
            this.repaint();
        }
    }
    alterPattern(pattern: any, attrObject: any, repaint: boolean = false) {
        Object.assign(pattern, attrObject);
        pattern.afterAlteration();
        pattern.updateProperties();
        if (repaint) {
            this.paint(pattern);
        }
    }
    saveToHistory() {
        this.history.add(this.get());
    }
    repaint() {
        this.paint();
    }
    /**
     * Repaints the frame. This means that present HTML elements are deleted and the patterns inside this frame are rerendered.
     * @param {*} pattern 
     */
    paint(pattern?: any) {
        if (pattern === undefined) {//render all
            console.warn("Full re-render");
            this.paintPanel.innerHTML = "";
            this.renderOrder.forEach(id => {
                if (this.patterns[id] == undefined) {
                    console.error("Tried to render not existing id " + id);
                    return;
                }
                if (!this.patterns[id].isMask) {
                    this.render(id);
                }
            });
        } else {
            let el = document.getElementById(pattern.id);
            if (el !== null) {
                el.remove();
            }
            this.render(pattern.id);
        }
    }
    /**
     * Renders a pattern to a frame. This means that the svg code is created and appended to the HTML element "paintPanel".
     * @param {*} id ID of the pattern that should be rendered
     */
    render(id: string = "") {
        //get positioning
        let paintPortRect = this.parentElement.getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();
        //render patterns
        let pattern = this.patterns[id];
        if (pattern.display) {
            let rotation = pattern.rotation;
            if (this.boundId == pattern.id) {//dont rotate on ausschneide ansicht
                pattern.rotation = 0;
            }
            let domString = "<svg role=" + this.role + " id='" + id + "' viewBox='-" + Math.trunc(paintPortRect.x) + " -" + Math.trunc(paintPortRect.y) + " " + Math.trunc(bodyRect.width) + " " + Math.trunc(bodyRect.height) + "' style='z-index:" + (this.renderOrder.indexOf(id) + 3) + ";position:absolute;top:0;left:0;height:100%;width:100%;'>" + pattern.fullHTML(true) + "</svg>";
            pattern.rotation = rotation;
            let template = document.createElement('template');
            domString = domString.trim();
            template.innerHTML = domString;
            //opacity
            if (template.content.firstChild) {
                (template.content.firstChild as HTMLElement).style.opacity = String(this.opacity);
                this.paintPanel.append(template.content.firstChild);
            }
            this._fixEventBubbling(id);
        }
    }
    /**
     * By default the touchevent is not bubbled out of the svg, so it has to be done manually.
     * This function attaches event listeners to svg with 'id' and passes touchevents up the
     * tree. 
     */
    _fixEventBubbling(id: string) {
        let svg = this.paintPanel.querySelector(`svg[id='${id}']`);
        if (svg) {
            svg.addEventListener("touchmove", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                this.paintPanel.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e));
            });
            svg.addEventListener("touchstart", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                this.paintPanel.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e));
            });
            svg.addEventListener("touchend", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                this.paintPanel.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e));
            });
        }
    }
    /**
     * Removes patterns from this Frame. Does not remove Frame.
     */
    clear() {
        this.focusedPattern = undefined;
        for (let id in this.patterns) {
            this.remove(this.patterns[id]);
        }
    }
    /**
     * Loads a Frame + patterns that hast been exported with Frame.get().
     * @param {JSON} FrameJSON a JSON Object that will be loaded
     * @param {boolean} trueCopy also copies the IDs if true
     * @param {boolean} loadInfoBox should pattern InfoBoxes be created
     */
    load(frameJSON: any = {}, trueCopy: boolean = true, loadInfoBox: boolean = true) {
        //check valid
        if (frameJSON.version != this.version) {
            console.warn("Loading frame from another version");
        }
        if (frameJSON.type != "Frame") {
            console.error("frame cannot load save of type " + frameJSON.type);
            return;
        }
        //load
        if (trueCopy) this.id = frameJSON.attributes.id;
        for (let i in frameJSON.attributes.patterns) {
            let patternJSON = this.copy(frameJSON.attributes.patterns[i]);
            let PatternClass = PatternRegistry.getClass(patternJSON.subtype);
            let pattern = new PatternClass();
            //directly inject id
            if (trueCopy) pattern.id = patternJSON.attributes.id;
            delete patternJSON.attributes.id;
            this.append(pattern);
            pattern.load(patternJSON);
            if (loadInfoBox) {
                this.infoBoxManager.newBox(pattern);
            }
        }
    }
    /**
     * Returns the JSON representation of this frame.
     */
    get() {
        //get patterns
        let passPatterns = [];
        for (let i = 0; i < this.renderOrder.length; i++) {
            let currPat = this.patterns[this.renderOrder[i]];
            passPatterns.push(currPat.get());
        }
        let obj = super.get();
        Object.assign(obj,
            {
                type: "Frame",
                attributes: {
                    id: this.id,
                    width: this.width,
                    height: this.height,
                    patterns: this.copy(passPatterns)
                }
            });
        return obj;
    }
    reset() {
        this.clear();
        this.history.clear();
    }
    /**
     * Removes all ui elements from dom
     */
    delete() {
        this.clear();
        this.paintPanel.remove();
        this.uiLayer.remove();
    }
}