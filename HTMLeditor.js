class HTMLeditor{

    activeProjects = new Array();

    detectMouseOnMarkerDistance = 12;
    rotationMarkerDistanceFromPattern = 20;//TODO remove after relocation

    minCoordinate = -2048;
    editOpacity = 0.8;

    savePower = true;
    keepHistory = true;
    exclusivView = false;

    colorSchemeLight = true;

    state = {
        currentAction:"none",
        editedObject:undefined,
        mouseDownInfo:undefined,
        view:"arange",
        currentProject: 0,
        gridsize: 1,
        draggingInfo: undefined
    }

    defaultSizing = {
        rect:{
            height:100,
            width:100,
        },
        circle:{
            radius:50
        },
        ellipse:{
            xRadius:60,
            yRadius:30
        },
        line:{
            length:140,
            width:6
        }
    }

    constructor(environment){
        this.environment = environment;
        //setup viewport
        this.environment.layout.viewport.style.cssText = "position:relative;overflow:hidden";
        this.drawingViewport = this.environment.layout.resultViewport;
        this.drawingViewport.style.cssText = "height:512px;width:512px;";
        //config
        this.savePower = this.environment.config.savePower.checked;
        this.environment.config.savePower.addEventListener("change",(e) => {this.savePower = e.target.checked});
        //init control
        this.environment.control.editSVG.cursor.addEventListener("click",() => {this.focus();this.setDrawingType("none")});
        this.environment.control.editSVG.newRect.addEventListener("mousedown",() => {this.setDrawingType("drag_rect0")});
        this.environment.control.editSVG.newRect.addEventListener("mouseup",() => {this.setDrawingType("rect0")});

        this.environment.control.editSVG.newCircle.addEventListener("mousedown",() => {this.setDrawingType("drag_circle0")});
        this.environment.control.editSVG.newCircle.addEventListener("mouseup",() => {this.setDrawingType("circle0")});

        this.environment.control.editSVG.newEllipse.addEventListener("mousedown",() => {this.setDrawingType("drag_ellipse0")});
        this.environment.control.editSVG.newEllipse.addEventListener("mouseup",() => {this.setDrawingType("ellipse0")});

        this.environment.control.editSVG.newLine.addEventListener("mousedown",() => {this.setDrawingType("drag_line0")});
        this.environment.control.editSVG.newLine.addEventListener("mouseup",() => {this.setDrawingType("line0")});

        this.environment.control.editSVG.newPath.addEventListener("click",() => {this.setDrawingType("path0")});
        
        for(let key in this.environment.control.meta.gridsize){
            this.environment.control.meta.gridsize[key].addEventListener("click",() => {this.changeGrid(this.environment.control.meta.gridsize[key].value)});
        }
        for(let key in this.environment.control.meta.bgColor){
            this.environment.control.meta.bgColor[key].addEventListener("click",()=>{this.changeBackground(this.environment.control.meta.bgColor[key].value)});
        }
        
        let colorInput = new CustomColorInput("pseudo-input", "#660033");
        this.environment.control.meta.paintColor.append(colorInput);
        this.environment.control.meta.paintColor.addEventListener("click",()=>{this.setDrawingType("none")});
        colorInput.addEventListener("change",(e) => {this.setPaintColor(e.target.value)});

        this.environment.control.meta.exclusiveView.addEventListener("change", (e)=>{
            this.setExclusiveView(e.target.checked);
        });
        this.environment.control.export.file.addEventListener("click",() => {this.exportFile()});

        this.environment.control.history.back.addEventListener("click",()=>{this.reverseLastAction()});
        this.environment.control.history.forwards.addEventListener("click",()=>{this.reInitLastReverse()});
        this.environment.control.history.back.classList.add("disabled");
        this.environment.control.history.forwards.classList.add("disabled");

        //init mouse events
        this.environment.layout.viewport.addEventListener("contextmenu", event => {
            event.preventDefault();
            this.openContextMenu(event);
            return false;
        },false);
        this.environment.layout.viewport.addEventListener("mousemove",event =>{
            this.mouseMoved(event);
        });
        this.environment.layout.viewport.addEventListener("mousedown",event => {
            this.mouseDown(event);
        });
        this.environment.layout.viewport.addEventListener("mouseup",event => {
            this.mouseUp(event);
        });
    }
    mouseDown(event){
        this.closeContextMenu();
        this.setMouseInfo(event);
        if(event.which==1 && this.currentAction !== "none"){
            let type = "none";
            //if new drawing type is selected
            if(["edit0","path1"].indexOf(this.state.currentAction) == -1){
                this.clearViewportUI();
            }
            let pattern;
            switch (this.state.currentAction) {
                case "rect0":
                    pattern = this.addPattern("Rect",event.clientX,event.clientY);
                    this.focus(pattern);
                    type = "rect1";
                    break;
                case "circle0":
                    pattern = this.addPattern("Circle",event.clientX,event.clientY);
                    this.focus(pattern);
                    type = "circle1";
                    break;
                case "ellipse0":
                    pattern = this.addPattern("Ellipse", event.clientX,event.clientY);
                    this.focus(pattern);
                    type = "ellipse1";
                    break;
                case "line0":
                    pattern = this.addPattern("Line", event.clientX,event.clientY);
                    this.focus(pattern);
                    type = "line1";
                    break;
                case "path0":
                    pattern = this.addPattern("Path", event.clientX,event.clientY);
                    this.focus(pattern);
                    type = "path1";
                    this.addHelperMarker(this.relX(event.clientX),this.relY(event.clientY),0,"check");
                    break;
                case "path1":
                    type = "path1";
                    break;
                //edit
                case "edit0":
                    let closestMarker = this.closestMarker(this.relX(event.clientX,0,undefined,1),this.relY(event.clientY,0,undefined,1));
                    //start dragging marker
                    if (closestMarker.distance < this.detectMouseOnMarkerDistance) {
                        this.state.editedObject = closestMarker.marker;
                        type = "dragMarker";
                    }else if(event.target.parentElement.id == this.focusedPattern().id){//start dragging pattern
                        this.setDraggingInfo(this.currProj().frame().patterns[event.target.parentElement.id], event);
                        type = "dragPattern";
                    }else{//do nothing
                        type = "edit0";
                    }
                    break;
                default:
                    break;
            }
            this.state.currentAction = type;
        }
    }
    mouseMoved(event){
        if(this.state.currentAction !== "none"){
            let pattern = this.focusedPattern();
            let points;
            switch (this.state.currentAction) {
                case "rect1":
                    this.currProj().alterPattern(pattern,{
                        height:this.relY(event.clientY,pattern.yOrigin,2),
                        width:this.relX(event.clientX,pattern.xOrigin,2),
                    });
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    break;
                case "circle1":
                    this.currProj().alterPattern(pattern,{
                        radius:PointOperations.distance(0,0,this.relX(event.clientX,pattern.xOrigin,-2048),this.relY(event.clientY,pattern.yOrigin,-2048))
                    });
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    break;
                case "ellipse1":
                    this.currProj().alterPattern(pattern,{
                        yRadius:this.relY(event.clientY,pattern.yOrigin,2),
                        xRadius:this.relX(event.clientX,pattern.xOrigin,2)
                    });
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                case "line1":
                    this.currProj().alterPattern(pattern,{
                        yEnd:this.relY(event.clientY,0,this.minCoordinate),
                        xEnd:this.relX(event.clientX,0,this.minCoordinate)
                    });
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    break;
                case "path1":
                    points = JSON.parse(JSON.stringify(pattern.points));
                    points.pop();
                    points.pop();
                    //get position for extra/curve markers
                    let x = this.relX(event.clientX);
                    let y = this.relY(event.clientY);
                    let midLast;
                    if(points.length > 0){
                        midLast = PointOperations.halfwayVector([points[points.length - 1].x,points[points.length - 1].y],[x,y]);
                    }else{
                        midLast = PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[x,y]);
                    }
                    let midNext = PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[x,y]);
                    points.push({method:"L",x:this.relX(event.clientX,0),y:this.relY(event.clientY,0),extraX:midLast[0],extraY:midLast[1], type:"round"});
                    points.push({method:"L",x:pattern.xOrigin,y:pattern.yOrigin,extraX:midNext[0],extraY:midLast[1],type:"round"});
                    this.currProj().alterPattern(pattern,{points:points});
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    this.addHelperMarker(pattern.xOrigin, pattern.yOrigin, 0, "check");
                    break;
                case "marker1":
                    points = JSON.parse(JSON.stringify(pattern.points));
                    points.pop();
                    points.push({method:"L",x:this.relX(event.clientX,0,2),y:this.relY(event.clientY,0,2)})
                    this.currProj().alterPattern(pattern, {points:points});
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    break;
                //dragged from new pattern
                case "drag_rect0":
                    pattern = this.addPattern("Rect",event.clientX-parseInt(this.defaultSizing.rect.width/2),event.clientY-parseInt(this.defaultSizing.rect.height/2));
                    this.currProj().alterPattern(pattern,this.defaultSizing.rect);
                    this.finalizeDraggedInPattern(pattern, event);
                    break;
                case "drag_circle0":
                    pattern = this.addPattern("Circle",event.clientX,event.clientY);
                    this.currProj().alterPattern(pattern,this.defaultSizing.circle);
                    this.finalizeDraggedInPattern(pattern, event);
                    break;
                case "drag_ellipse0":
                    pattern = this.addPattern("Ellipse",event.clientX,event.clientY);
                    this.currProj().alterPattern(pattern,this.defaultSizing.ellipse);
                    this.finalizeDraggedInPattern(pattern, event);
                    break;
                case "drag_line0":
                    pattern = this.addPattern("Line",event.clientX,event.clientY-parseInt(this.defaultSizing.line.length/2));
                    this.currProj().alterPattern(pattern,{
                        xEnd:this.relX(event.clientX),
                        yEnd:this.relY(event.clientY+parseInt(this.defaultSizing.line.length/2)),
                        width:this.defaultSizing.line.width
                    });
                    this.finalizeDraggedInPattern(pattern, event);
                    break;
                //edit
                case "edit0":
                    this.adjustPatternToOther(pattern, this.state.editedObject, event);
                    break;
                case "dragPattern":
                    this.currProj().frame().setOpacity(this.editOpacity);
                    this.adjustPatternToOther(pattern, this.state.editedObject, event);
                    break;
                case "dragMarker":
                    this.currProj().frame().setOpacity(this.editOpacity);
                    this.adjustPatternToOther(pattern, this.state.editedObject, event);
                    break;
                default:
                    break;
            }
            this.currProj().repaint(pattern);
        }
    }
    mouseUp(event){
        this.closeContextMenu();
        this.clearViewportUI("rotationDisplay");
        if(event.which==1){
            let pattern = this.focusedPattern();
            let xPrecise = this.relX(event.clientX,0,undefined,1);
            let yPrecise = this.relY(event.clientY,0,undefined,1);
            let x = this.relX(event.clientX);
            let y = this.relY(event.clientY);
            switch (this.state.currentAction) {
                case "none":
                    //if pattern is clicked -> start editing
                    if(event.target.parentElement.getAttribute("role") === "main"){
                        //dont focus main pattern on mask frame
                        if(this.currProj().frame().boundId != event.target.parentElement.id){
                            this.startEdit(this.patternById(event.target.parentElement.id));
                        }
                    }
                    break;
                case "rect1":
                    this.finishNewPattern(event);
                    break;
                case "circle1":
                    this.finishNewPattern(event);
                    break;
                case "ellipse1":
                    this.finishNewPattern(event);
                    break;
                case "line1":
                    this.finishNewPattern(event);
                    break;
                case "path1":
                    let points = JSON.parse(JSON.stringify(pattern.points));
                    if (this.detectMouseOnMarkerDistance > PointOperations.distance(pattern.xOrigin,pattern.yOrigin,this.relX(event.clientX,0,undefined,1),this.relY(event.clientY,0,undefined,1))) {//finish pattern
                        //path finished
                        points.pop();
                        points.pop();
                        let midNext = PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[points[points.length - 1].x,points[points.length - 1].y]);
                        points.push({method:"L",x:pattern.xOrigin,y:pattern.yOrigin,extraX:midNext[0],extraY:midNext[1],type:"round"});
                        this.clearViewportUI();
                        this.setDrawingType("path0");
                        this.currProj().frame().newBox(pattern);
                        //TODO replace with default path
                        if(this.focusedPattern().points.length < 2 && x == this.focusedPattern().xOrigin && y == this.focusedPattern().yOrigin){//check for invalid path
                            this.removePattern(this.focusedPattern());
                            alert("Halte die Maus gedrückt und ziehe sie anschließend, um eine Form zu erstellen.");
                            return true;
                        }
                        this.setDrawingType("none");
                        this.currProj().alterPattern(pattern, {points:points}, true);
                        this.saveToHistory();
                        this.currProj().repaint(pattern);
                        this.startEdit(this.focusedPattern());
                    } else {
                        //add point to path
                        points.pop();
                        //get position for extra/curve markers
                        let midLast;
                        if(points.length > 0){
                            midLast = PointOperations.halfwayVector([points[points.length - 1].x,points[points.length - 1].y],[x,y]);
                        }else{
                            midLast = PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[x,y]);
                        }
                        let midNext = PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[x,y]);
                        points.push({method:"L",x:x,y:y,extraX:midLast[0],extraY:midLast[1],type:"round"});
                        points.push({method:"L",x:pattern.xOrigin,y:pattern.yOrigin,extraX:midNext[0],extraY:midNext[1],type:"round"});
                        this.currProj().alterPattern(pattern, {points:points}, true);
                        this.currProj().repaint(pattern);
                    }
                    break;
                //edit
                case "edit0":
                    //stop edit on active element
                    this.stopEdit();
                    //if pattern is clicked -> start editing
                    if(event.target.parentElement.getAttribute("role") === "main"){
                        //dont focus main pattern on mask frame
                        if(this.currProj().frame().boundId != event.target.parentElement.id){
                            this.startEdit(this.patternById(event.target.parentElement.id));
                        }
                    }
                    break;
                case "dragMarker"://also click marker
                    let closestMarker = this.closestMarker(x,y);
                    //if mouse up position == mouse down position => marker is clicked
                    if(closestMarker.distance < this.detectMouseOnMarkerDistance && this.state.mouseDownInfo.x == xPrecise && this.state.mouseDownInfo.y == yPrecise){
                        //dont focus main pattern on mask frame
                        this.focusedPattern().markerClicked(closestMarker.marker);
                        this.clearViewportUI();
                        this.startEdit(this.focusedPattern());
                    }
                    this.state.currentAction = "edit0";
                    this.currProj().frame().updateInfoBox(pattern);
                    this.saveToHistory();
                    this.currProj().frame().setOpacity(1);
                    this.currProj().repaint(pattern);
                    break;
                case "dragPattern":
                    this.state.currentAction = "edit0";
                    this.currProj().frame().updateInfoBox(pattern);
                    this.saveToHistory();
                    this.currProj().frame().setOpacity(1);
                    this.currProj().repaint(pattern);
                    break;
                default:
                    break;
            }
        }
    }
    prepareEdit(pattern = this.focusedPattern()){
        if(["edit0","dragPattern","dragMarker"].indexOf(this.state.currentAction) != -1){
            this.addHelperOutline(pattern);
            let infoBox = this.infoBoxManager().boxById(pattern.id);
            if(infoBox != undefined){
                infoBox.highlight();
            }
            let markers = pattern.getMarkers();
            let lines = pattern.getLines();
            for(let i in lines){
                let lineParams = lines[i];
                this.addHelperLine(...lineParams);
            }
            for(let i in markers){
                let markerParams = markers[i];
                this.addHelperMarker(...markerParams);
            }
        }else{
            console.warn(`Cannot prepare pattern for edit in ${this.state.currentAction} mode`);
        }
    }
    adjustPatternToOther(pattern, editedObject, event){
        switch (this.state.currentAction) {
            case "dragMarker":
                //change marker position
                editedObject.x = this.relX(event.clientX);
                editedObject.y = this.relY(event.clientY);
                this.clearViewportUI();
                let changes;
                if(["Rect","Ellipse","Path", "Circle"].indexOf(pattern.constructor.name) != -1){//multi selection
                    if(editedObject.memorize == "rotate"){
                        let angle = PointOperations.angle([this.relX(event.clientX,0,undefined,1) - pattern.center[0],this.relY(event.clientY,0,undefined,1) - pattern.center[1]]);
                        changes = {
                            rotation: parseInt(UniversalOps.snap(angle, 3, [0, 45, 90, 135, 180, 225, 270, 315], true, 360))
                        }
                        this.currProj().alterPattern(pattern, changes);
                        this.addHelperRotation(pattern);
                    }
                }
                switch (pattern.constructor.name) {//single selection
                    case "Rect":
                        if(editedObject.memorize == "top left"){
                            let newHeight = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.bottomLeft(),...pattern.bottomRight());
                            let newWidth = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.bottomRight(),...pattern.topRight());
                            changes = {
                                width: newWidth,
                                height: newHeight,
                                xOrigin: pattern.xOrigin - (newWidth - pattern.width),
                                yOrigin: pattern.yOrigin - (newHeight - pattern.height)
                            }
                        }else if(editedObject.memorize == "top right"){
                            let newHeight = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.bottomLeft(),...pattern.bottomRight());
                            changes = {
                                width: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.bottomLeft()),
                                height: newHeight,
                                yOrigin: pattern.yOrigin - (newHeight - pattern.height)
                            }
                        }else if(editedObject.memorize == "bottom left"){
                            let newWidth = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topRight(),...pattern.bottomRight());
                            changes = {
                                width: newWidth,
                                height: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.topRight()),
                                xOrigin: pattern.xOrigin - (newWidth - pattern.width)
                            }
                        }else if(editedObject.memorize == "bottom right"){
                            changes = {
                                width: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.bottomLeft()),
                                height: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.topRight())
                            }
                        }else if(editedObject.memorize == "top"){
                            let newHeight = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.bottomLeft(),...pattern.bottomRight());
                            changes = {
                                yOrigin: pattern.yOrigin - (newHeight - pattern.height),
                                height: newHeight
                            }
                        }else if(editedObject.memorize == "bottom"){
                            changes = {
                                height: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.topRight())
                            }
                        }else if(editedObject.memorize == "left"){
                            let newWidth = PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topRight(),...pattern.bottomRight());
                            changes = {
                                xOrigin: pattern.xOrigin - (newWidth - pattern.width),
                                width: newWidth
                            }
                        }else if(editedObject.memorize == "right"){
                            changes = {
                                width: PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.topLeft(),...pattern.bottomLeft())
                            }
                        }
                        //check if changes are valid
                        if((changes.width != undefined && changes.width < 1) || (changes.height != undefined && changes.height < 1)){
                            console.log("Invalid property for rect");
                            break;
                        }
                        this.currProj().alterPattern(pattern, changes);
                        break;
                    case "Circle":
                        if(editedObject.memorize == "radius"){
                            changes = {
                                radius: Math.max(this.state.gridsize, PointOperations.distance(pattern.xOrigin,pattern.yOrigin,this.relX(event.clientX),this.relY(event.clientY)))
                            }
                            this.currProj().alterPattern(pattern, changes);
                        }
                        break;
                    case "Ellipse":
                        if(editedObject.memorize == "xRadius"){
                            changes = {
                                xRadius: Math.max(this.state.gridsize, PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.top(),...pattern.bottom()))
                            }
                        }else if(editedObject.memorize == "yRadius"){
                            changes = {
                                yRadius: Math.max(this.state.gridsize, PointOperations.lineDistance(this.relX(event.clientX),this.relY(event.clientY),...pattern.left(),...pattern.right()))
                            }
                        }
                        this.currProj().alterPattern(pattern, changes);
                        break;
                    case "Line":
                        if(editedObject.memorize == "start"){
                            let pointsDontOverlap = (this.relX(event.clientX) != pattern.xEnd || this.relY(event.clientY) != pattern.yEnd);
                            changes = {
                                xOrigin: (pointsDontOverlap)?this.relX(event.clientX):this.relX(event.clientX)+this.state.gridsize,//prevent same start and endpoint
                                yOrigin: (pointsDontOverlap)?this.relY(event.clientY):this.relY(event.clientY)+this.state.gridsize
                            }
                        }else if(editedObject.memorize == "end"){//endX endY
                            let pointsDontOverlap = (this.relX(event.clientX) != pattern.xOrigin || this.relY(event.clientY) != pattern.yOrigin);
                            changes = {
                                xEnd: (pointsDontOverlap)?this.relX(event.clientX):this.relX(event.clientX)+this.state.gridsize,//prevent same start and endpoint
                                yEnd: (pointsDontOverlap)?this.relY(event.clientY):this.relY(event.clientY)+this.state.gridsize
                            }
                        }else if(editedObject.memorize == "width"){
                            changes = {
                                width: 2* PointOperations.lineDistance(this.relX(event.clientX,0,this.minCoordinate,1), this.relY(event.clientY,0,this.minCoordinate,1), pattern.xOrigin, pattern.yOrigin, pattern.xEnd, pattern.yEnd) - 20
                            }
                        }
                        this.currProj().alterPattern(pattern, changes);
                        break;
                    case "Path":
                        let points = JSON.parse(JSON.stringify(pattern.points));
                        let neutralizeRotation = (point)=>{return PointOperations.rotateAroundPoint(pattern.center, point, -pattern.rotation)};
                        let pointRotatedToNeutral = neutralizeRotation([this.relX(event.clientX), this.relY(event.clientY)]);
                        //change point position
                        if(editedObject.memorize === points.length - 1){//if the last point is moved that is equal to origin
                            points[editedObject.memorize].x = pointRotatedToNeutral[0];
                            points[editedObject.memorize].y = pointRotatedToNeutral[1];
                            //move last point and Origin
                            let changes = {
                                xOrigin: pointRotatedToNeutral[0],
                                yOrigin: pointRotatedToNeutral[1],
                                points: points
                            }
                            this.currProj().alterPattern(pattern, changes);
                        }else if(String(editedObject.memorize).substr(0,5) === "extra"){
                            //set to curve if moved directly
                            let point = points[editedObject.memorize.substr(5)];
                            if(point.method !== "Q"){
                                point.method = "Q";
                            }
                            point.extraX = pointRotatedToNeutral[0];
                            point.extraY = pointRotatedToNeutral[1];
                            this.currProj().alterPattern(pattern,{points:points})
                        }else if(editedObject.memorize != "rotate"){
                            points[editedObject.memorize].x = pointRotatedToNeutral[0];
                            points[editedObject.memorize].y = pointRotatedToNeutral[1];
                            this.currProj().alterPattern(pattern,{points:points});
                        }
                        break;
                    default:
                        break;
                }
                //repaint point and marker and outline
                this.prepareEdit(pattern);
                if(!this.savePower){
                    this.currProj().frame().updateInfoBox(pattern);
                }
                break;
            case "dragPattern":
                let newOriginX = this.relX(event.clientX,(this.state.draggingInfo.relToPatternOriginX));
                let newOriginY = this.relY(event.clientY,(this.state.draggingInfo.relToPatternOriginY));
                if (newOriginX !== pattern.xOrigin || newOriginY !== pattern.yOrigin) {
                    this.clearViewportUI();
                    pattern.translateTo(newOriginX, newOriginY);
                    //repaint point and marker
                    this.prepareEdit(pattern);
                    if(!this.savePower){
                        this.currProj().frame().updateInfoBox(pattern);
                    }
                }
                break;
            default:
                //edit, but no further action
                break;
        }
    }
    finishNewPattern(event){
        this.fixClickOnlyPattern(event);
        this.currProj().frame().newBox(this.focusedPattern());
        this.saveToHistory();
        this.setDrawingType("none");
        this.startEdit(this.focusedPattern());
    }
    setDraggingInfo(editedObject, event){
        this.state.editedObject = editedObject;
        let draggingInfo = {
            x:this.relX(event.clientX,0,undefined,1),
            y:this.relX(event.clientY,0,undefined,1),
            relToPatternOriginX:this.relX(event.clientX,0,undefined,1) - this.state.editedObject.xOrigin,
            relToPatternOriginY:this.relY(event.clientY,0,undefined,1) - this.state.editedObject.yOrigin
        };
        this.state.draggingInfo = draggingInfo;
    }
    setMouseInfo(event){
        this.state.mouseDownInfo = {
            x:this.relX(event.clientX,0,undefined,1),
            y:this.relY(event.clientY,0,undefined,1)
        }
    }
    finalizeDraggedInPattern(pattern, event){
        this.currProj().frame().newBox(pattern);
        this.focus(pattern);
        this.state.currentAction = "dragPattern";
        this.setDraggingInfo(pattern, event);
        this.clearViewportUI();
        this.addHelperOutline(pattern);
    }
    /**
     * Checks if the mouse position that finishes the pattern is the same as the one that started the pattern. If thats the case the pattern is assigned the default properties.
     * @param {MouseEvent} event last mouse event
     */
     fixClickOnlyPattern(event){
        let pattern = this.focusedPattern();
        //if mouse has not moved since pattern creation
        if(this.relX(event.clientX) == pattern.xOrigin && this.relY(event.clientY) == pattern.yOrigin){
            switch (pattern.constructor.name) {
                case "Rect":
                    this.currProj().alterPattern(pattern,
                        {
                            width:this.defaultSizing.rect.width,
                            height:this.defaultSizing.rect.height,
                            xOrigin:this.relX(event.clientX-parseInt(this.defaultSizing.rect.width/2)),
                            yOrigin:this.relY(event.clientY-parseInt(this.defaultSizing.rect.height/2))
                        });
                    break;
                case "Circle":
                    this.currProj().alterPattern(pattern,
                        {
                            radius:this.defaultSizing.circle.radius,
                            xOrigin:this.relX(event.clientX),
                            yOrigin:this.relY(event.clientY)
                        });
                    break;
                case "Ellipse":
                    this.currProj().alterPattern(pattern,
                        {
                            xRadius:this.defaultSizing.ellipse.xRadius,
                            yRadius:this.defaultSizing.ellipse.yRadius,
                            xOrigin:this.relX(event.clientX),
                            yOrigin:this.relY(event.clientY)
                        });
                    break;
                case "Line":
                    this.currProj().alterPattern(pattern,{
                        xEnd:this.relX(event.clientX),
                        yEnd:this.relY(event.clientY+parseInt(this.defaultSizing.line.length/2)),
                        width:this.defaultSizing.line.width,
                        xOrigin:this.relX(event.clientX),
                        yOrigin:this.relY(event.clientY-parseInt(this.defaultSizing.line.length/2))
                    });
                    break;
            }
        }
    }
    newProject(){
        let newProject = new Project(this.environment.layout.elementOverview, this);
        newProject.init();
        this.drawingViewport.append(newProject.container);
        this.activeProjects.push(newProject);
        //TEMP: does not work with multiple projects
        this.saveToHistory();
    }
    setExclusiveView(status){
        if(status){
            this.exclusivView = true;
            if(this.focusedPattern() != undefined){
                this.startEdit(this.focusedPattern());
            }
            this.repaint();
        }else{
            this.exclusivView = false;
            //show all patterns
            for(let id in this.currProj().frame().patterns){
                this.currProj().frame().patterns[id].display = true;
            }
            this.currProj().frame().updateInfoBox();
            this.repaint();
        }
    }
    closeContextMenu(){
        if(this.contextMenu != undefined){
            this.contextMenu.close();
            delete this.contextMenu;
        }
    }
    openContextMenu(event){
        this.closeContextMenu();
        let options = [];
        //if clicked on pattern
        if(event.target.parentElement.getAttribute("role") === "main"){
            //dont focus main pattern on mask frame
            if(this.currProj().frame().boundId != event.target.parentElement.id){
                this.stopEdit();
                this.startEdit(this.patternById(event.target.parentElement.id));
                options.push({
                    label:"carve out",
                    clickHandler:()=>{this.changeView("mask");this.closeContextMenu();},
                    icon:"img/cut_out.svg",
                    type:"general"
                },{
                    label:"duplicate",
                    clickHandler:()=>{this.duplicateCurrentPattern();this.closeContextMenu();},
                    icon:"img/cut_out.svg",
                    type:"general"
                },{
                    label:"mirror vertically",
                    clickHandler:()=>{this.mirrorCurrentPatternVertical();this.closeContextMenu();},
                    icon:"img/cut_out.svg",
                    type:"general"
                },{
                    label:"mirror horizontally",
                    clickHandler:()=>{this.mirrorCurrentPatternHorizontal();this.closeContextMenu();},
                    icon:"img/cut_out.svg",
                    type:"general"
                },{
                    label:"delete",
                    clickHandler:()=>{this.removePattern(this.focusedPattern());this.saveToHistory();this.closeContextMenu();},
                    icon:"img/cut_out.svg",
                    type:"general"
                });
            }
        }
        //if a pattern is focussed
        if(this.focusedPattern() != undefined){
            options = [
                ...this.focusedPattern().additionalOptions(this.relX(event.clientX, 0, undefined, 1), this.relY(event.clientY, 0, undefined, 1), ()=>{
                    this.closeContextMenu();
                    this.currProj().frame().repaint();
                    this.clearViewportUI();
                    this.saveToHistory();
                    this.startEdit(this.focusedPattern());
                }),
                ...options
            ];
        }
        //no options possible
        if(options.length == 0){
            options = [{
                label:"no actions here",
                clickHandler:()=>{this.closeContextMenu();},
                icon:"X"
            }]
        }
        this.contextMenu = new ContextMenu(event.clientX, event.clientY, this.environment.layout.viewport);
        this.contextMenu.deploy(options);
    }
    mirrorCurrentPatternVertical(){
        if(this.focusedPattern() != undefined){
            this.focusedPattern().mirrorVertically();
            this.currProj().repaint(this.focusedPattern());
            this.saveToHistory();
            this.clearViewportUI();
            this.prepareEdit();
        }
    }
    mirrorCurrentPatternHorizontal(){
        if(this.focusedPattern() != undefined){
            this.focusedPattern().mirrorHorizontally();
            this.currProj().repaint(this.focusedPattern());
            this.saveToHistory();
            this.clearViewportUI();
            this.prepareEdit();
        }
    }
    duplicateCurrentPattern(){
        if(this.focusedPattern() != undefined){
            this.duplicate(this.focusedPattern());
            this.saveToHistory();
        }
    }
    addPattern(type,x,y){
        let pattern = this.currProj().newPattern(type,this.relX(x),this.relY(y));
        return pattern;
    }
    addHelperMarker(...params){
        let marker = new Marker(this.drawingViewport,...params);
        this.uiLayer().append(marker.container);
        this.markers().push(marker);
    }
    addHelperOutline(pattern){
        let outline = new Outline(this.drawingViewport, pattern);
        this.uiLayer().append(outline.container);
    }
    addHelperLine(x,y,endX,endY){
        let uiline = new UILine(this.drawingViewport, x,y,endX,endY);
        this.uiLayer().append(uiline.container);
    }
    addHelperRotation(pattern){
        let rot = new RotateDisplay(this.drawingViewport, pattern.center[0], pattern.center[1], pattern.rotation);
        this.rotateDisplay = rot;
        rot.addTo(this.uiLayer());
    }
    /**
     * DOES NOT SAVE TO HISTORY
     * @param {Number} id 
     */
    removePattern(pattern){
        this.stopEdit();
        this.currProj().frame().remove(pattern);
    }
    reverseLastAction(){
        let focusedId = (this.focusedPattern() != undefined)?this.focusedPattern().id:undefined;
        this.focus();
        this.setDrawingType("none");
        this.currProj().frame().history.reverseLast();
        //refocus pattern
        if(focusedId && this.currProj().frame().patterns[focusedId] != undefined){
            this.startEdit(this.currProj().frame().patterns[focusedId]);
        }
        //update ui
        this.updateHistoryButtons();
    }
    reInitLastReverse(){
        let focusedId = (this.focusedPattern() != undefined)?this.focusedPattern().id:undefined;
        this.focus();
        this.setDrawingType("none");
        this.currProj().frame().history.reInitLast();
        //refocus pattern
        if(focusedId && this.currProj().frame().patterns[focusedId] != undefined){
            this.startEdit(this.currProj().frame().patterns[focusedId]);
        }
        //update ui
        this.updateHistoryButtons();
    }
    updateHistoryButtons(){
        if(this.currProj().frame().isMaskFrame){
            this.environment.control.history.back.classList.add("disabled");
            this.environment.control.history.forwards.classList.add("disabled");
        }else{
            if(this.currProj().frame().history.currentState != this.currProj().frame().history.firstPreserved){
                this.environment.control.history.back.classList.remove("disabled");
            }
            if(this.currProj().frame().history.currentState != this.currProj().frame().history.history.length - 1){
                this.environment.control.history.forwards.classList.remove("disabled");
            }
            if(this.currProj().frame().history.currentState == this.currProj().frame().history.firstPreserved){
                this.environment.control.history.back.classList.add("disabled");
            }
            if(this.currProj().frame().history.currentState == this.currProj().frame().history.history.length - 1){
                this.environment.control.history.forwards.classList.add("disabled");
            }
        }
    }
    changeView(view = "arange"){
        if(this.state.view != view){
            let focusedPattern = this.focusedPattern();
            //need to know if certain views are possible in current state
            let editPossible = (this.state.currentAction == "edit0")?true:false;
            this.stopEdit();
            this.setDrawingType("none");
            switch (view) {
                case "arange":
                    this.state.view = view;
                    this.currProj().setFrame(this.currProj().keyframes[0]);
                    this.currProj().setContext();
                    this.saveToHistory();
                    
                    break;
                case "mask":
                    if(editPossible){
                        if(focusedPattern.allowMask){
                            this.state.view = view;
                            this.currProj().setFrame(focusedPattern.maskLayer);
                            console.log(focusedPattern);
                            //ui
                            let callback = ()=>{this.changeView("arange")};
                            this.environment.layout.container.append(new Banner("Punch out view", "Quit", callback));
                            
                        }else{
                            alert("Cannot mask this pattern");
                        }
                    }
                    break;
                default:
                    break;
            }
            this.updateHistoryButtons();
        }
    }
    startEdit(pattern){
        this.setDrawingType("none");
        this.state.currentAction = "edit0";
        this.focus(pattern);
        this.prepareEdit(pattern);
        if(this.exclusivView){
            //hide all patterns that are not selected
            for(let id in this.currProj().frame().patterns){
                if(id != this.focusedPattern().id){
                    this.currProj().frame().patterns[id].display = false;
                }
            }
            this.currProj().frame().updateInfoBox();
        }
        this.repaint();
    }
    stopEdit(){
        if(this.exclusivView){
            //show all patterns
            for(let id in this.currProj().frame().patterns){
                this.currProj().frame().patterns[id].display = true;
            }
            this.currProj().frame().updateInfoBox();
        }
        this.currProj().frame().stopEdit();
        this.state.currentAction = "none";
        this.repaint();
    }
    patternById(id){
        return this.currProj().frame().patternById(id);
    }
    focusedPattern(){
        return this.currProj().frame().focusedPattern;
    }
    /**
     * Focuses on the passed pattern. That means that editing will be enabled for the passed pattern.
     * If pattern is undefined the focus on all patterns is removed.
     * @param {Pattern} pattern pattern that should be focused
     */
    focus(pattern){
        this.currProj().frame().focus(pattern);
    }
    clearViewportUI(specificElement){
        if(specificElement == "rotationDisplay"){
            if(this.rotateDisplay != undefined){
                this.rotateDisplay.element.remove();
            }
        }else{
            this.currProj().frame().clearUI();
        }
    }
    duplicate(pattern){
        let dup = PatternManipulator.createWithSameClass(pattern);
        this.currProj().frame().append(dup);
        dup.addMaskFrame(this.currProj().frame().parentElement, this.currProj().frame().infoBoxContainer, this.currProj().frame().editor);
        dup.load(pattern.get(), false);
        dup.translateTo(dup.xOrigin+20, dup.yOrigin+20);
        this.currProj().frame().newBox(dup);
        this.stopEdit();
        this.startEdit(dup);
    }
    currProj(){
        return this.activeProjects[this.state.currentProject];
    }
    markers(){
        return this.currProj().frame().markers;
    }
    uiLayer(){
        return this.currProj().frame().uiLayer;
    }
    changeBackground(value){
        let targetColor;
        switch (value) {
            case "light":
                targetColor = "#ffffff";
                this.colorSchemeLight = true;
                break;
            case "dark":
                targetColor = "#1e1e1e";
                this.colorSchemeLight = false;
                break;
        }
        document.querySelector(':root').style.setProperty('--viewport-background', targetColor);
        this.currProj().drawBg("dotts", this.state.gridsize, this.colorSchemeLight);
    }
    relX(x, remove = 0, min = -2048,steps = this.state.gridsize, max = 2048){
        let a = parseInt(Math.min(Math.max(x - (this.drawingViewport.getBoundingClientRect().x + remove), min), max) );
        let overhang = a%steps;
        if(overhang < steps/2){
            return a - overhang;
        }else{
            return a - overhang + steps;
        }
    }
    relY(y, remove = 0, min = -2048, steps = this.state.gridsize, max = 2048){
        const a = parseInt(Math.min(Math.max(y - (this.drawingViewport.getBoundingClientRect().y + remove), min), max) );
        let overhang = a%steps;
        if(overhang < steps/2){
            return a - overhang;
        }else{
            return a - overhang + steps;
        }
    }
    saveToHistory(){
        if(this.keepHistory){
            this.currProj().frame().saveToHistory();
            this.updateHistoryButtons();
        }
    }
    loadProject(projectJSON = {}){
        //TEMP
        this.currProj().load(projectJSON);
    }
    /**
     * Set the attribute "selected" of element to true. All other elements in this group will be set to selected false. This is a UI function.
     * @param {HTMLElement} element HTMLElement that should be selected
     * @param {Object} elementGroup HTMLElements of the same radio selection type
     */
    selectRadio(element, elementGroup){
        Object.keys(elementGroup).forEach(key => {
            elementGroup[key].removeAttribute("selected");
        });
        element.setAttribute("selected","true");
    }
    setDrawingType(type){
        this.closeContextMenu();
        if(["rect0","circle0","ellipse0","line0","path0"].indexOf(type) !== -1){
            this.setCursor(this.drawingViewport,"crosshair");
        }else{
            this.setCursor(this.drawingViewport, "default");
        }
        if(this.state.currentAction == "edit0"){
            this.stopEdit();
        }
        switch (type) {
            case "none":
                this.selectRadio(this.environment.control.editSVG.cursor, this.environment.control.editSVG);
                break;
            case "rect0":
                this.selectRadio(this.environment.control.editSVG.newRect, this.environment.control.editSVG);
                break;
            case "circle0":
                this.selectRadio(this.environment.control.editSVG.newCircle, this.environment.control.editSVG);
                break;
            case "ellipse0":
                this.selectRadio(this.environment.control.editSVG.newEllipse, this.environment.control.editSVG);
                break;
            case "line0":
                this.selectRadio(this.environment.control.editSVG.newLine, this.environment.control.editSVG);
                break;
            case "path0":
                this.selectRadio(this.environment.control.editSVG.newPath, this.environment.control.editSVG);
                break;
            default:
                break;
        }
        this.state.currentAction = type;
    }
    /**
     * Returns the closest marker in the viewport to x,y. 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    closestMarker(x,y){
        let min = {
            distance:Infinity,
            marker:{},
        }
        for (let i = 0; i < this.markers().length; i++) {
            let distToPoint = PointOperations.distance(x,y,this.markers()[i].x,this.markers()[i].y);
            if(distToPoint <= min.distance){
                min = {
                    distance:distToPoint,
                    marker:this.markers()[i]
                }
            }
        }
        return min;
    }
    mouseOnCanvas(event){
        let canvasBox = this.drawingViewport.getBoundingClientRect();
        return PointOperations.withinBounds(event.clientX,event.clientY,canvasBox.x,canvasBox.y,canvasBox.x + parseInt(this.currProj().dimensions.width),canvasBox.y+parseInt(this.currProj().dimensions.height));
    }
    changeGrid(size){
        if(size < 4){
            this.state.gridsize = 1;
        }else{
            this.state.gridsize = Math.pow(2,size);
        }
        this.currProj().drawBg("dotts",this.state.gridsize);
    }
    setPaintColor(color = "#000000"){
        this.currProj().setColor(color);
    }
    setCursor(element,style = "cursor"){
        element.style.cursor = style;
    }
    getPatternClientRect(pattern,inViewport = false){
        if(inViewport){
            let rect = document.getElementById(String(pattern.id)).querySelector('[svg-editor-type="mainPattern"]').getBoundingClientRect();
            let box = {
                x:this.relX(rect.x),
                y:this.relY(rect.y),
                height:rect.height,
                width:rect.width
            }
            return box;
        }else{
            return document.getElementById(String(pattern.id)).querySelector('[svg-editor-type="mainPattern"]').getBoundingClientRect();
        }
    }
    repaint(pattern){
        this.currProj().repaint(pattern);
    }
    /**
     * Getter for infoBoxManager of current frame
     * @returns infoBoxManager of current frame
     */
    infoBoxManager(){
        return this.currProj().frame().infoBoxManager;
    }
    toTop(pattern){
        this.currProj().toTop(pattern);
        this.infoBoxManager().toTop(pattern);
    }
    toBottom(pattern){
        this.currProj().toBottom(pattern);
        this.infoBoxManager().toBottom(pattern);
    }
    oneUp(pattern){
        this.currProj().oneUp(pattern);
        this.infoBoxManager().oneUp(pattern);
    }
    oneDown(pattern){
        this.currProj().oneDown(pattern);
        this.infoBoxManager().oneDown(pattern);
    }
    exportFile(){
        let content = Exporter.createSVGFileContent(this.currProj());
        console.log(content);
        Exporter.download("easy_svg_online_creation", content);
    }
}