class UniversalOps{
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
}