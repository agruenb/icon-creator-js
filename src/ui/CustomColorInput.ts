import IconCreatorGlobal from "../IconCreatorGlobal";

const BUCKET_SVG = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M 96 207 L 96 433 Q 96 448 96 463 Q 96 496 129 496 Q 144 496 159 496 L 353 496 Q 368 496 383 496 Q 416 496 416 463 Q 416 448 416 433 L 416 207 Q 416 192 401 192 L 111 192 Q 96 192 96 207 Z" fill="#7d7d7d" /><path d="M 96 144 L 144 144 L 144 111 Q 144 96 149 91 L 155 85 Q 160 80 175 80 L 337 80 Q 352 80 357 85 L 363 91 Q 368 96 368 111 L 368 144 L 416 144 L 416 111 Q 416 96 416 81 Q 416 32 367 32 Q 352 32 337 32 L 175 32 Q 160 32 145 32 Q 96 32 96 81 Q 96 96 96 111 L 96 144 Z" fill="#7d7d7d" /><path d="M 64 143 L 64 193 Q 64 208 79 208 L 433 208 Q 448 208 448 193 L 448 143 Q 448 128 433 128 L 79 128 Q 64 128 64 143 Z" fill="#575757" /><path class="paint-drip" d="M 192 128 L 192 304 A 32 32 0 0 0 256 309 Q 256 304 256 289 L 256 240 A 24 24 0 0 1 304 235 Q 304 240 304 255 L 304 384 A 32 32 0 0 0 368 389 Q 368 384 368 369 L 368 128 L 192 128 Z" fill="#b0b0b0" /></svg>`;

export default class CustomColorInput{
    constructor(className:string | Array<string>, color:string, isBucket:boolean = false){
        const id = IconCreatorGlobal.id();
        //display
        let display = document.createElement("label");
        if(Array.isArray(className)){
            display.classList.add(...className)
        }else{
            display.classList.add(className)
        }
        display.setAttribute("for",id);

        let input = document.createElement("input");
        let paintDrip: SVGPathElement | null = null;

        if (isBucket) {
            display.style.cssText = "position:relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer;";
            
            let toolIcon = document.createElement("div");
            toolIcon.classList.add("tool-icon");
            toolIcon.innerHTML = BUCKET_SVG;
            display.append(toolIcon);

            paintDrip = display.querySelector(".paint-drip") as SVGPathElement;
            if(paintDrip) {
                paintDrip.setAttribute("fill", color);
            }
        } else {
            display.style.cssText = "position:relative;background:"+color+";";
        }

        //input
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "color";
        input.value = color;
        input.id = id;
        input.addEventListener("change",(event)=>{
            if (isBucket) {
                if(paintDrip) {
                    paintDrip.setAttribute("fill", (event.currentTarget as HTMLInputElement).value);
                }
            } else {
                display.style.backgroundColor = (event.currentTarget as HTMLInputElement).value;
            }
        });
        display.append(input);
        
        Object.assign(display, this);
        return display;
    }
}