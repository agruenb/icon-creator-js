export default class UniversalOps{
    /**
     * Snaps a value to other closest value, if it is within the tolerance.
     * @param {Number} value 
     * @param {Number} tolerance 
     * @param {Array} snapValues 
     * @param {Boolean} loop default: false; if true: values within the tolerance of max snap to 0 (if it is within snapValues). 
     * @param {Number} max need if loop is set to true
     * @returns the closest snap value or the value itself.
     */
    static snap(value = 0, tolerance = 0, snapValues = [], loop = false, max = 0){
        let closestValuePos = 0;
        let loopValue = value + 1;
        if(loop){
            loopValue = max - tolerance;
        }
        for(let index in snapValues){//find closest snap value
            if(Math.abs(value%loopValue - snapValues[index]) < Math.abs(value%loopValue - snapValues[closestValuePos])){
                closestValuePos = index;
            }
        }
        if(Math.abs(value%loopValue - snapValues[closestValuePos]) <= tolerance){//if closest snap value is within tolerance
            return snapValues[closestValuePos];
        }else{
            return value;
        }
    }
    static distributeEqually(max, steps, min = 0,forceInteger = false){
        let ret = [];
        let stepsize = (max - min) / steps
        for(let i = 0; i < steps; i++){
            if (forceInteger) {
                ret.push(min + parseInt(i * stepsize));
            } else {
                ret.push(min + i * stepsize);
            }
        }
        return ret;
    }
    /**
     * Set the attribute "selected" of element to true. All other elements in this group will be set to selected false. This is a UI function.
     * @param {HTMLElement} element HTMLElement that should be selected
     * @param {Object} elementGroup HTMLElements of the same radio selection type
     */
    static selectRadio(element, elementGroup){
        Object.keys(elementGroup).forEach(key => {
            elementGroup[key].removeAttribute("selected");
        });
        element.setAttribute("selected","true");
    }
}