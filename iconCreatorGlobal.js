class IconCreatorGlobal{
    version = "0";
    id;
    constructor(){
        this.id = IconCreatorGlobal.id();
    }
    static id(){
        return String((new Date()).getTime()+parseInt(Math.random()*1000000));
    }
    /**
     * Creates a copy of an object
     * @param {*} object 
     * @returns the copy
     */
    copy(object = {}){
        return JSON.parse(JSON.stringify(object));
    }
    /**
     * add header data to get function
     */
    get(){
        return {
            version: this.version
        };
    }
}