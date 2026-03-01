export default class IconCreatorGlobal {
    version: string = "0";
    id: string;

    rotationMarkerDistanceFromPattern = 20;
    floatingPointPrecision = 0;//between 1 and 100

    constructor() {
        this.id = IconCreatorGlobal.id();
    }
    static id(): string {
        const win = (typeof window !== 'undefined' ? window : global) as any;
        if (win.icon_creator_global_index_counter === undefined) {
            win.icon_creator_global_index_counter = 0;
        }
        return String(win.icon_creator_global_index_counter++);
    }
    static el(type: string, text: string, className: string) {
        let el = document.createElement(type);
        el.classList.add(className);
        if (text) {
            el.innerHTML = text;
        }
        return el;
    }
    /**
     * Creates a copy of an object
     * @param {*} object 
     * @returns the copy
     */
    copy(object = {}) {
        return JSON.parse(JSON.stringify(object));
    }
    /**
     * add header data to get function
     */
    get() {
        return {
            version: this.version
        };
    }
    /**
     * Limits the floating point precision. pt stands for point. Has performance problems?!
     * @param {Number} number to limit precision
     * @returns the number with limited precision (rounded)
     */
    pt(number: number) {
        return Number.parseFloat(number.toFixed(this.floatingPointPrecision))
    }
}