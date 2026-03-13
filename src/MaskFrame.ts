import Frame from "./Frame";
import PatternRegistry from "./shared/PatternRegistry";

export default class MaskFrame extends Frame {

    isMaskFrame: boolean = true;

    constructor(parentElement: HTMLElement, infoBoxContainer: HTMLElement | undefined, editor: any) {
        super(parentElement, infoBoxContainer, editor);
    }
    makeMask(pattern: any) {
        pattern.isMask = true;
        pattern.borderWidth = 1;
        pattern.color = "rgba(224, 0, 0, 0.5)";
    }
    //@Override
    append(pattern: any) {
        //for all patterns that are not the pattern that should be masked
        if (this.boundId != pattern.id) {
            this.makeMask(pattern);
            //patterns that are already in the maskLayer do not add again
            if (this.boundId) {
                let targetPattern = this.patterns[this.boundId];
                if (targetPattern && targetPattern.maskLayer) {
                    let patternAlreadyInMask = targetPattern.maskLayer.patterns.filter((existingPattern: any) => {
                        return pattern.id === existingPattern.id;
                    }).length > 0;

                    if (!patternAlreadyInMask) {
                        targetPattern.maskLayer.patterns.push(pattern);
                    }
                }
            }
        }
        let id = pattern.id;
        this.patterns[id] = pattern;
        this.renderOrder.push(String(id));
    }
    remove(pattern: any, repaint: boolean = true) {
        //remove from maskLayer of patter
        if (this.boundId) {
            let targetPattern = this.patterns[this.boundId];
            if (targetPattern && targetPattern.maskLayer) {
                let indexToBeRemoved = targetPattern.maskLayer.patterns.indexOf(pattern);
                if (indexToBeRemoved !== -1) {
                    targetPattern.maskLayer.patterns.splice(indexToBeRemoved, 1);
                }
            }
        }
        super.remove(pattern, repaint);
    }
    //@Override
    saveToHistory() {
        //mask frame does not keep history
    }
    //@Override
    paint(pattern?: any) {
        //mask frame always render all patterns again
        this.paintPanel.innerHTML = "";
        this.renderOrder.forEach(id => {
            if (this.patterns[id] == undefined) {
                console.error("Tried to render not existing id " + id);
                return;
            }
            this.render(id);
        });
    }
    //@override
    newBox(pattern: any) {

    }
    //@override
    updateInfoBox(pattern?: any) {

    }
    //@Override
    show() {
        this.paintPanel.style.display = "block";
    }
    //@Override
    hide() {
        this.paintPanel.innerHTML = "";
        this.paintPanel.style.display = "none";
    }
    /**
     * @param {JSON} FrameJSON a JSON Object that will be loaded
     * @param {boolean} trueCopy also copies the IDs if true
     */
    load(frameJSON: any = {}, trueCopy: boolean = true) {
        //check valid
        if (frameJSON.version != this.version) {
            console.warn("Loading MaskFrame from another version");
        }
        if (frameJSON.subtype != "MaskFrame") {
            console.error("MaskFrame cannot load save of type " + frameJSON.type, frameJSON);
            return;
        }
        //load
        super.load(frameJSON, trueCopy);
    }
    /**
     * Returns the JSON representation of this frame.
     */
    get() {
        let obj = super.get();
        Object.assign(obj,
            {
                type: "Frame",
                subtype: "MaskFrame"
            });
        (obj as any).attributes.boundId = this.boundId;
        return obj;
    }
}