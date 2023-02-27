export default class PatternManipulator{
    /**
     * Does not work with mask frames/fillers
     * @param {*} pattern 
     * @returns 
     */
    static duplicate(pattern){
        let dup = PatternManipulator.createWithSameClass(pattern);
        dup.load(pattern.get());
        return dup;
    }
    static createWithSameClass(object){
        return new (object.getClass())();
    }
}