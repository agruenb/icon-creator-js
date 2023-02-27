import HelperPattern from "./HelperPattern";

export default class Marker extends HelperPattern{
    constructor(viewportElement, x,y,memorize,icon="empty",rotation = 0){
        super(viewportElement);
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.memorize = memorize;
        let iconElement = document.createElement("img");
        let elementString = "";
        switch (icon) {
            case "empty":
                elementString = '<svg style="position:absolute;top:0;left:0;" height="12" width="12" viewBox="0 0 512 512">'+ new Circle(256,256,240,"#307ffd",32,"#307ffd").cleanHTML()+'</svg>';
                break;
            case "check":
                elementString = '<svg viewBox="0 0 512 512"><circle  cx="256" cy="256" r="240" fill="#ffffff" stroke="#000001" stroke-width="20" /><line x1="112" y1="256" x2="192" y2="352" stroke="#000000" fill="#000000" stroke-width="86"  stroke-linecap="round" /><line x1="192" y1="352" x2="384" y2="176" stroke="#000000" fill="#000000" stroke-width="86"  stroke-linecap="round" /></svg>';
                break;
            case "path_straight":
                iconElement.src = "img/curve_marker.svg";
                break;
            case "path_curve":
                iconElement.src = "img/curved_edge_marker_5.svg";
                break;
            case "octagon":
                iconElement.src = "img/octagon_marker.svg";
                break;
            case "arrow":
                elementString = '<svg viewBox="0 0 512 512"><path  d="M 96 16 L 416 16 Q 496 16 496 96 L 496 416 Q 496 496 416 496 L 96 496 Q 16 496 16 416 L 16 96 Q 16 16 96 16 Z" stroke="#000000" fill="#ffffff" stroke-width="20"/><path  d="M 64 240 L 64 272 Q 64 304 96 304 L 288 304 L 288 336 Q 288 368 320 368 Q 352 368 432 272 Q 444 256 432 240 Q 352 144 320 144 Q 288 144 288 176 L 288 208 L 96 208 Q 64 208 64 240 Z" stroke="#000000" fill="#000000" stroke-width="0"/></svg>';
                break;
            case "arrow-double":
                iconElement.src = "img/dual_direction_marker.svg";
                break;
            case "arrow-rotate":
                iconElement.src = "img/rotate_marker.svg";
                break;
            case "arrow-resize":
                iconElement.src = "img/sys_resize_marker.svg";
                break;
            case "point":
                iconElement.src = "img/point_marker.svg";
                break;
            default:
                elementString = '<svg style="position:absolute;top:0;left:0;" height="12" width="12" viewBox="0 0 512 512">'+ new Circle(256,256,240,"#307ffd",32,"#307ffd").cleanHTML()+'</svg>';
                break;
        }
        this.container.innerHTML = elementString;
        this.container.append(iconElement);
        let rect = this.drawingViewport.getBoundingClientRect();
        this.container.style.cssText = `position:absolute;top:${this.y+rect.y-8}px;left:${this.x+rect.x-8}px;height:16px;width:16px;transform:rotate(${this.rotation}deg)`;
    }
    repaint(){
        this.element.style.cssText = `position:absolute;top:${this.y-8}px;left:${this.x-8}px;height:16px;width:16px;transform:rotate(${this.rotation}deg)`;
    }
}