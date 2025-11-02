export default class IconCreatorGlobal {
    version: string = "0";
    id: string;

    rotationMarkerDistanceFromPattern = 20;
    floatingPointPrecision = 0;//between 1 and 100

    constructor() {
        this.id = IconCreatorGlobal.id();
    }
    static id() {
        //@ts-expect-error
        return String(window.icon_creator_global_index_counter++);
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