/**
 * A central registry for Pattern subclasses to register themselves against.
 * This prevents circular dependencies where a loader needs to import every subclass,
 * while the subclasses also need to import Pattern base classes.
 */
export default class PatternRegistry {
    private static registry: { [key: string]: any } = {};

    /**
     * Register a class constructor to the registry.
     * @param name Name of the class to register
     * @param _class The class constructor reference
     */
    static register(name: string, _class: any): void {
        PatternRegistry.registry[name] = _class;
    }

    /**
     * Retrieve a registered class constructor by name.
     * @param name The registered string name, e.g. "Rect"
     * @returns The class constructor, or undefined if not found
     */
    static getClass(name: string): any | undefined {
        let patternClass = PatternRegistry.registry[name];
        if (!patternClass) {
            console.warn(`[PatternRegistry] Pattern "${name}" is not registered.`);
        }
        return patternClass;
    }
}
