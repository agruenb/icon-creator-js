import Rect from "./Rect";

import PointOperations from "../shared/PointOperations.js";

export default class ReferenceImage extends Rect{

    isReference = true;

    constructor(x, y, width, height, url, aspectRatio = 1){//aspectRatio is width/height
        super(x,y, width, height);
        this.url = url;
        this.ratio = aspectRatio.toFixed(3);
    }
    getOutlinePattern(){
        let outline = new Rect(this.xOrigin, this.yOrigin, this.width, this.height);
        outline.rotation = this.rotation;
        outline.center = this.center;
        return outline;
    }
    getMarkers(){
        let r = [];
        //rotate marker
        r.push([...this.rotatePoint(PointOperations.orthogonalIcon(this.xOrigin,this.yOrigin,this.xOrigin+this.width,this.yOrigin, this.rotationMarkerDistanceFromPattern, "top")),"rotate","arrow-rotate", this.rotation]);
        //corner markers
        r.push([...this.topLeft(),"top left","point", this.rotation]);
        r.push([...this.topRight(),"top right","point", this.rotation]);
        r.push([...this.bottomLeft(),"bottom left","point", this.rotation]);
        r.push([...this.bottomRight(),"bottom right","point", this.rotation]);
        return r;
    }
    markerEdited(marker, limit, xPrecise, yPrecise){
        let changes;
        if(marker.memorize == "rotate"){
            let angle = PointOperations.angle([xPrecise - this.center[0], yPrecise - this.center[1]]);
            changes = {
                rotation: parseInt(UniversalOps.snap(angle, this.snapTolerance, this.rotationSnap, true, 360))
            }
        }else if(marker.memorize == "top left"){
            let newHeight = this.pt(PointOperations.geradeDistance(...this.bottomLeft(),...this.bottomRight(),marker.x,marker.y));
            let newWidth = this.pt(newHeight*this.ratio);
            changes = {
                width: newWidth,
                height: newHeight,
                xOrigin: this.xOrigin - (newWidth - this.width),
                yOrigin: this.yOrigin - (newHeight - this.height)
            }
        }else if(marker.memorize == "top right"){
            let newHeight = this.pt(PointOperations.geradeDistance(...this.bottomLeft(),...this.bottomRight(),marker.x,marker.y));
            let newWidth = this.pt(newHeight*this.ratio);
            changes = {
                width: newWidth,
                height: newHeight,
                yOrigin: this.yOrigin - (newHeight - this.height)
            }
        }else if(marker.memorize == "bottom left"){
            let newHeight = this.pt(PointOperations.geradeDistance(...this.topRight(),...this.topLeft(),marker.x,marker.y));
            let newWidth = this.pt(newHeight*this.ratio);
            changes = {
                width: newWidth,
                height: newHeight,
                xOrigin: this.xOrigin - (newWidth - this.width)
            }
        }else if(marker.memorize == "bottom right"){
            let newHeight = this.pt(PointOperations.geradeDistance(...this.topLeft(),...this.topRight(),marker.x,marker.y));
            let newWidth = this.pt(newHeight*this.ratio);
            changes = {
                width: newWidth,
                height: newHeight 
            }
        }
        return changes;
    }
    cleanHTML(){
        return `<image
        href="${this.url}"
        x="${this.xOrigin}"
        y="${this.yOrigin}"
        height="${this.height}"
        width="${this.width}"
        ${(this.rotation != 0)?`transform="rotate(${this.rotation},${this.center[0]},${this.center[1]})" `:''}/>`;
    }
}