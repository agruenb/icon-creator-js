import PatternInfoBox from "./PatternInfoBox";
import Animator from "../animation/Animator";
import Frame from "../Frame";

export default class InfoBoxManager {
    boxes: PatternInfoBox[] = [];
    animationDuration: number = 0.4;
    padding: number = 7;
    container: HTMLElement | undefined;
    keyframe: Frame | boolean;

    constructor(container: HTMLElement | undefined, keyframe: Frame | boolean) {
        this.container = container;
        this.keyframe = keyframe;
    }

    newBox(pattern: any): void {
        let newBox = new PatternInfoBox(pattern, this.keyframe as Frame);
        this.add(newBox);
    }

    updateBox(pattern?: any): void {
        if (pattern != undefined) {
            let box = this.boxById(pattern.id);
            if (box != undefined) {
                box.update();
            }
        } else {
            console.log("update all");
            for (let i in this.boxes) {
                this.boxes[i].update();
            }
        }
    }

    add(box: PatternInfoBox): void {
        this.appendTop(box);
        this.boxes.unshift(box);
    }

    remove(pattern: any): void {
        let box = this.boxById(pattern.id);
        if (box != undefined) {
            box.element.remove();
            let i = 0;
            while (i < this.boxes.length && this.boxes[i].boundId != pattern.id) {
                i++;
            }
            if (i < this.boxes.length) {
                this.boxes.splice(i, 1);
            } else {
                console.log(pattern.id, this.boxes);
                console.warn("Could not find box to remove");
            }
        } else {
            console.warn("Tried to remove non-existent PatternInfoBox.");
        }
    }

    hide(): void {
        for (let i in this.boxes) {
            this.boxes[i].element.remove();
        }
        console.log("Hid:", this.boxes);
    }

    show(): void {
        if (typeof this.keyframe === 'boolean' || !this.keyframe) return;
        const frame = this.keyframe as Frame;
        for (let i in frame.renderOrder) {
            let box = this.boxes.filter((box) => {
                return box.boundId == frame.renderOrder[i];
            })[0];
            if (box != undefined) {
                this.appendTop(box);
            }
        }
    }

    appendTop(box: PatternInfoBox): void {
        if (!this.container) return;
        if (this.boxes.length == 0) {
            this.container.append(box.element);
        } else {
            this.container.insertBefore(box.element, this.container.children[0]);
        }
    }

    muteAll(): void {
        this.boxes.forEach(element => {
            element.mute();
        });
    }

    boxById(id: string): PatternInfoBox | undefined {
        return this.boxes.filter(box => box.boundId == id)[0];
    }

    toTop(pattern: any): void {
        if (!this.container) return;
        const box = this.boxById(pattern.id);
        if (box) {
            this.container.insertBefore(box.element, this.container.children[0]);
        }
    }

    toBottom(pattern: any): void {
        if (!this.container) return;
        const box = this.boxById(pattern.id);
        if (box) {
            this.container.append(box.element);
        }
    }

    oneUp(pattern: any): void {
        if (!this.container) return;
        const box = this.boxById(pattern.id);
        if (!box) return;
        let index = [...this.container.children].indexOf(box.element);
        if (index != 0) {
            Animator.switchStack(this.container.children[index - 1], box.element, this.animationDuration, this.padding);
            setTimeout(() => {
                if (this.container) this.container.insertBefore(box.element, this.container.children[index - 1]);
            }, this.animationDuration * 1000);
        }
    }

    oneDown(pattern: any): void {
        if (!this.container) return;
        let length = this.container.children.length;
        const box = this.boxById(pattern.id);
        if (!box) return;
        let index = [...this.container.children].indexOf(box.element);
        if (index == length - 2) {
            Animator.switchStack(box.element, this.container.children[this.container.children.length - 1], this.animationDuration, this.padding);
            setTimeout(() => {
                if (this.container) this.container.append(box.element);
            }, this.animationDuration * 1000);
        } else if (index != length - 1) {
            Animator.switchStack(box.element, this.container.children[index + 1], this.animationDuration, this.padding);
            setTimeout(() => {
                if (this.container) this.container.insertBefore(box.element, this.container.children[index + 2]);
            }, this.animationDuration * 1000);
        }
    }
}
