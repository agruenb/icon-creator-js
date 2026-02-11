export default class UniversalOps {
    /**
     * Snaps a value to other closest value, if it is within the tolerance.
     * @param {number} value 
     * @param {number} tolerance 
     * @param {number[]} snapValues 
     * @param {boolean} loop default: false; if true: values within the tolerance of max snap to 0 (if it is within snapValues). 
     * @param {number} max need if loop is set to true
     * @returns the closest snap value or the value itself.
     */
    static snap(value: number = 0, tolerance: number = 0, snapValues: number[] = [], loop: boolean = false, max: number = 0): number {
        if (snapValues.length === 0) return value;
        let closestValuePos = 0;
        let loopValue = value + 1;
        if (loop) {
            loopValue = max - tolerance;
        }
        for (let i = 0; i < snapValues.length; i++) { //find closest snap value
            if (Math.abs(value % loopValue - snapValues[i]) < Math.abs(value % loopValue - snapValues[closestValuePos])) {
                closestValuePos = i;
            }
        }
        if (Math.abs(value % loopValue - snapValues[closestValuePos]) <= tolerance) { //if closest snap value is within tolerance
            return snapValues[closestValuePos];
        } else {
            return value;
        }
    }

    static distributeEqually(max: number, steps: number, min: number = 0, forceInteger: boolean = false): number[] {
        let ret: number[] = [];
        let stepsize = (max - min) / steps
        for (let i = 0; i < steps; i++) {
            if (forceInteger) {
                ret.push(min + Math.trunc(i * stepsize));
            } else {
                ret.push(min + i * stepsize);
            }
        }
        return ret;
    }

    /**
     * Set the attribute "selected" of element to true. All other elements in this group will be set to selected false. This is a UI function.
     * @param {HTMLElement} element HTMLElement that should be selected
     * @param {HTMLElement[] | { [key: string]: HTMLElement }} elementGroup HTMLElements of the same radio selection type
     */
    static selectRadio(element: HTMLElement, elementGroup: HTMLElement[] | { [key: string]: HTMLElement }) {
        if (Array.isArray(elementGroup)) {
            elementGroup.forEach(el => {
                if (el) el.removeAttribute("selected");
            });
        } else {
            Object.keys(elementGroup).forEach(key => {
                if (elementGroup[key]) elementGroup[key].removeAttribute("selected");
            });
        }
        element.setAttribute("selected", "true");
    }
}