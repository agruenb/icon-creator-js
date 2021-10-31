class PatternManipulator{
    static duplicate(pattern){
        let dup = PatternManipulator.createWithSameClass(pattern);
        dup.load(pattern.get());
        console.log(pattern.get());
        return dup;
    }
    static createWithSameClass(object){
        return Object.create(object.__proto__);
    }
}