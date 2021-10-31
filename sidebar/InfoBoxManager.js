class InfoBoxManager{

    boxes = new Array();

    constructor(container, keyframe){
        this.container = container;
        this.keyframe = keyframe;
        //add anchor node
    }
    newBox(pattern){
        let newBox = new PatternInfoBox(pattern, this.keyframe);
        this.add(newBox);
    }
    updateBox(pattern){
        let thatBox = this.boxById(pattern.id);
        thatBox.update();
    }
    add(box){
        if(this.boxes.length == 0){
            this.container.append(box.element);
        }else{
            this.container.insertBefore(box.element, this.container.children[0]);
        }
        this.boxes.unshift(box);
    }
    remove(pattern){
        let box = this.boxById(pattern.id);
        if(box != undefined){
            box.element.remove();
            let remIndex = this.boxes.indexOf(box);//performance?
            this.boxes.splice(remIndex,1);
        }else{
            console.warn("Tried to remove none existant PatternInfoBox.");
        }
    }
    muteAll(){
        this.container.querySelectorAll(".highlight").forEach(element => {
            element.classList.remove("highlight");
        });
    }
    boxById(id){
        return this.boxes.filter(box => box.boundId == id)[0];
    }
    toTop(pattern){
        this.container.insertBefore(this.boxById(pattern.id).element,this.container.children[0]);
    }
    toBottom(pattern){
        this.container.append(this.boxById(pattern.id).element);
    }
    oneUp(pattern){
        let index = [...this.container.children].indexOf(this.boxById(pattern.id).element);
        //if not first object
        if(index != 0){
            this.container.insertBefore(this.boxById(pattern.id).element,this.container.children[index - 1]);
        }
    }
    oneDown(pattern){
        let length = this.container.children.length;
        let index = [...this.container.children].indexOf(this.boxById(pattern.id).element);
        //if second to last object
        if(index == length - 2){
            console.log("second to last");
            this.container.append(this.boxById(pattern.id).element);
        }else
        if(index != length - 1){//if not last
            this.container.insertBefore(this.boxById(pattern.id).element, this.container.children[index + 2]);
        }
    }
}