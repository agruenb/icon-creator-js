class PatternManipulator{
    static duplicate(pattern){
        let dup = PatternManipulator.createWithSameClass(pattern);
        dup.load(pattern.get());
        return dup;
    }
    static createWithSameClass(object){
        return new object.__proto__.constructor;
    }
}