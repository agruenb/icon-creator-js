class IconCreatorGlobal{
    version = "0";
    id;

    rotationMarkerDistanceFromPattern = 20;
    
    constructor(){
        this.id = IconCreatorGlobal.id();
    }
    static id(){
        return String((new Date()).getTime()+parseInt(Math.random()*1000000));
    }
    static el(type,text,className){
        let el = document.createElement(type);
        el.classList.add(className);
        if(text){
            el.innerHTML = text;
        }
        return el;
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