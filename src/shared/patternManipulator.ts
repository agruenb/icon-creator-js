/**
 * Utility class for pattern manipulation operations like duplication.
 */
export default class PatternManipulator {
    /**
     * Does not work with mask frames/fillers.
     * @param pattern - The pattern to duplicate
     * @returns A new pattern of the same class with the same state
     */
    static duplicate(pattern: any): any {
        let dup = PatternManipulator.createWithSameClass(pattern);
        dup.load(pattern.get());
        return dup;
    }

    /**
     * Creates a new instance of the same class as the provided object.
     * @param object - An object with a getClass() method
     * @returns A new instance of the same class
     */
    static createWithSameClass(object: any): any {
        return new (object.getClass())();
    }
}
