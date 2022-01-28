class InfoBoxManager{

    boxes = new Array();

    animationDuration = 0.4;
    padding = 7;

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
        if(pattern != undefined){
            let box = this.boxById(pattern.id);
            box.update();
        }else{//update all
            console.log("update all");
            for(let i in this.boxes){
                this.boxes[i].update();
            }
        }
    }
    add(box){
        this.appendTop(box);
        this.boxes.unshift(box);
    }
    remove(pattern){
        let box = this.boxById(pattern.id);
        if(box != undefined){
            box.element.remove();
            let i = 0;
            while(this.boxes[i].boundId != pattern.id){
                i++;
            }
            if(i < this.boxes.length){
                this.boxes.splice(i,1);
            }else{
                console.log(pattern.id, this.boxes);
                console.warn("Could not find box to remove");
            }
        }else{
            console.warn("Tried to remove none existant PatternInfoBox.");
        }
    }
    hide(){
        for(let i in this.boxes){
            this.boxes[i].element.remove();
        }
        console.log("Hid:", this.boxes);
    }
    show(){
        for(let i in this.keyframe.renderOrder){
            let box = this.boxes.filter((box)=>{
                return box.boundId == this.keyframe.renderOrder[i];
            })[0];
            this.appendTop(box);
        }
    }
    appendTop(box){
        if(this.boxes.length == 0){
            this.container.append(box.element);
        }else{
            this.container.insertBefore(box.element, this.container.children[0]);
        }
    }
    muteAll(){
        this.boxes.forEach(element => {
            element.mute();
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
            Animator.switchStack(this.container.children[index -1], this.boxById(pattern.id).element, this.animationDuration, this.padding);
            setTimeout(()=>{
                this.container.insertBefore(this.boxById(pattern.id).element,this.container.children[index - 1]);
            },this.animationDuration * 1000);
        }
    }
    oneDown(pattern){
        let length = this.container.children.length;
        let index = [...this.container.children].indexOf(this.boxById(pattern.id).element);
        //if second to last object
        if(index == length - 2){
            Animator.switchStack(this.boxById(pattern.id).element,  this.container.children[this.container.children.length - 1], this.animationDuration, this.padding);
            setTimeout(()=>{
                this.container.append(this.boxById(pattern.id).element);
            },this.animationDuration * 1000);
        }else
        if(index != length - 1){//if not last
            Animator.switchStack(this.boxById(pattern.id).element,  this.container.children[index + 1], this.animationDuration, this.padding);
            setTimeout(()=>{
                this.container.insertBefore(this.boxById(pattern.id).element, this.container.children[index + 2]);
            },this.animationDuration * 1000);
        }
    }
}