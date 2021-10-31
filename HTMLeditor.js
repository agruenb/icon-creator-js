class HTMLeditor{

    activeProjects = new Array();

    detectMouseOnMarkerDistance = 15;
    rotationMarkerDistanceFromPattern = 20;

    savePower = true;

    state = {
        currentAction:"none",
        editedObject:undefined,
        mouseDownInfo:undefined,
        view:"arange",
        currentProject: 0,
        gridsize: 1  
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
        this.environment.control.editSVG.newRect.addEventListener("click",() => {this.setDrawingType("rect0")});
        this.environment.control.editSVG.newCircle.addEventListener("click",() => {this.setDrawingType("circle0")});
        this.environment.control.editSVG.newEllipse.addEventListener("click",() => {this.setDrawingType("ellipse0")});
        this.environment.control.editSVG.newLine.addEventListener("click",() => {this.setDrawingType("line0")});
        this.environment.control.editSVG.newPath.addEventListener("click",() => {this.setDrawingType("path0")});
        
        this.environment.control.meta.gridsize.addEventListener("change",() => {this.changeGrid(this.environment.control.meta.gridsize.value)});
        this.environment.control.meta.paintColor.addEventListener("change",(e) => {this.setPaintColor(e.target.value)});

        this.environment.control.history.back.addEventListener("click",()=>{this.reverseLastAction()});
        this.environment.control.history.forwards.addEventListener("click",()=>{this.reInitLastReverse()});
        
        this.environment.control.view.arange.addEventListener("click",() => {this.changeView("arange")});
        this.environment.control.view.mask.addEventListener("click",() => {this.changeView("mask")});
        this.environment.control.view.arange.setAttribute("selected","true");

        this.environment.control.output.cleanHTML.addEventListener("click",() => {this.environment.output.text.value = this.outputHTML()});
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
        if(event.which==1 && this.currentAction !== "none"){
            let type = "none";
            //if new drawing type is selected
            if(["edit0","path1"].indexOf(this.state.currentAction) == -1){
                this.clearViewportUI();
            }
            let id;
            switch (this.state.currentAction) {
                case "rect0":
                    id = this.addPattern("Rect",event.clientX,event.clientY);
                    this.focus(this.patternById(id));
                    type = "rect1";
                    break;
                case "circle0":
                    id = this.addPattern("Circle",event.clientX,event.clientY);
                    this.focus(this.patternById(id));
                    type = "circle1";
                    break;
                case "ellipse0":
                    id = this.addPattern("Ellipse", event.clientX,event.clientY);
                    this.focus(this.patternById(id));
                    type = "ellipse1";
                    break;
                case "line0":
                    id = this.addPattern("Line", event.clientX,event.clientY);
                    this.focus(this.patternById(id));
                    type = "line1";
                    break;
                case "path0":
                    id = this.addPattern("Path", event.clientX,event.clientY);
                    this.focus(this.patternById(id));
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
                        this.state.editedObject = this.currProj().frame().patterns[event.target.parentElement.id];
                        type = "dragPattern";
                        let mouseDownInfo = {
                            x:this.relX(event.clientX,0,undefined,1),
                            y:this.relX(event.clientY,0,undefined,1),
                            relToPatternOriginX:this.relX(event.clientX,0,undefined,1) - this.state.editedObject.xOrigin,
                            relToPatternOriginY:this.relY(event.clientY,0,undefined,1) - this.state.editedObject.yOrigin
                        };
                        this.state.mouseDownInfo = mouseDownInfo;
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
                        yEnd:this.relY(event.clientY,0,2),
                        xEnd:this.relX(event.clientX,0,2)
                    });
                    this.clearViewportUI()
                    this.addHelperOutline(pattern);
                    break;
                case "path1":
                    points = JSON.parse(JSON.stringify(pattern.points));
                    points.pop();
                    points.push({method:"L",x:this.relX(event.clientX,0),y:this.relY(event.clientY,0),extraX:10,extraY:10});
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
                //edit
                case "edit0":case "dragPattern":case "dragMarker":
                    if(this.focusedPattern().id != this.currProj().frame().boundId){
                        this.adjustPatternToOther(pattern, this.state.editedObject, event);
                        break;
                    }else{//if on maskLayser frame
                        console.log("Cannot edit in ausschneide mode");
                    }
                    break;
                default:
                    break;
            }
            this.currProj().repaint(pattern);
        }
    }
    mouseUp(event){
        this.closeContextMenu();
        if(event.which==1){
            let pattern = this.focusedPattern();
            switch (this.state.currentAction) {
                case "none":
                    //if pattern is clicked -> start editing
                    if(event.target.parentElement.getAttribute("role") === "main"){
                        this.startEdit(this.patternById(event.target.parentElement.id));
                    }
                    break;
                case "rect1":
                    this.finishNewPattern(event,"rect0");
                    break;
                case "circle1":
                    this.finishNewPattern(event,"circle0");
                    break;
                case "ellipse1":
                    this.finishNewPattern(event,"ellipse0");
                    break;
                case "line1":
                    this.finishNewPattern(event,"line0");
                    break;
                case "path1":
                    let points = JSON.parse(JSON.stringify(pattern.points));
                    if (this.detectMouseOnMarkerDistance > PointOperations.distance(pattern.xOrigin,pattern.yOrigin,this.relX(event.clientX,0,undefined,1),this.relY(event.clientY,0,undefined,1))) {//finish pattern
                        //path finished
                        points.pop();
                        points.push({method:"L",x:pattern.xOrigin,y:pattern.yOrigin,extraX:10,extraY:10});
                        this.clearViewportUI();
                        this.setDrawingType("path0");
                        this.infoBoxManager().newBox(pattern, this.currProj().frame());
                        if(this.focusedPattern().points.length < 2 && this.relX(event.clientX) == this.focusedPattern().xOrigin && this.relY(event.clientY) == this.focusedPattern().yOrigin){//check for invalid path
                            this.removePattern(this.focusedPattern());
                            alert("Halte die Maus gedrückt und ziehe sie anschließend, um eine Form zu erstellen.");
                            return true;
                        }
                        this.saveToHistory();
                        this.setDrawingType("none");
                        this.startEdit(this.focusedPattern());
                    } else {
                        points.push({method:"L",x:this.relX(event.clientX,0,2),y:this.relY(event.clientY,0,2),extraX:10,extraY:10});
                    }
                    this.currProj().alterPattern(pattern, {points:points}, true);
                    break;
                //edit
                case "edit0":
                    //nothing is written into editedObject -> focusedPattern was not clicked
                    //stop edit on active elementß
                    this.stopEdit();
                    //if pattern is clicked -> start editing
                    if(event.target.parentElement.getAttribute("role") === "main"){
                        this.startEdit(this.patternById(event.target.parentElement.id));
                    }
                    break;
                case "dragMarker":case "dragPattern":
                    this.state.currentAction = "edit0";
                    this.currProj().frame().infoBoxManager.updateBox(pattern);
                    this.saveToHistory();
                    break;
                default:
                    break;
            }
        }
    }
    prepareEdit(pattern = this.focusedPattern()){
        if(["edit0","dragPattern","dragMarker"].indexOf(this.state.currentAction) != -1){
            this.addHelperOutline(pattern);
            this.infoBoxManager().boxById(pattern.id).highlight();
            let rotatePoint = (point)=>{return PointOperations.rotateAroundPoint(pattern.center, point, pattern.rotation)};
            switch (pattern.constructor.name) {
                case "Rect":
                    this.addHelperMarker(...rotatePoint(PointOperations.orthogonalIcon(pattern.xOrigin,pattern.yOrigin,pattern.xOrigin+pattern.width,pattern.yOrigin, this.rotationMarkerDistanceFromPattern, "top")),"rotate","arrow-rotate", pattern.rotation);
                    this.addHelperMarker(...pattern.topLeft(),"top left","point", pattern.rotation);
                    this.addHelperMarker(...pattern.topRight(),"top right","point", pattern.rotation);
                    this.addHelperMarker(...pattern.bottomLeft(),"bottom left","point", pattern.rotation);
                    this.addHelperMarker(...pattern.bottomRight(),"bottom right","point", pattern.rotation);
                    this.addHelperMarker(...rotatePoint(PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[pattern.xOrigin,pattern.yOrigin+pattern.height])),"left","arrow-double", pattern.rotation);
                    this.addHelperMarker(...rotatePoint(PointOperations.halfwayVector([pattern.xOrigin+pattern.width,pattern.yOrigin],[pattern.xOrigin+pattern.width,pattern.yOrigin+pattern.height])),"right","arrow-double", pattern.rotation);
                    this.addHelperMarker(...rotatePoint(PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin],[pattern.xOrigin+pattern.width,pattern.yOrigin])),"top","arrow-double", pattern.rotation +90);
                    this.addHelperMarker(...rotatePoint(PointOperations.halfwayVector([pattern.xOrigin,pattern.yOrigin+pattern.height],[pattern.xOrigin+pattern.width,pattern.yOrigin+pattern.height])),"bottom","arrow-double", pattern.rotation + 90);
                    break;
                case "Circle":
                    this.addHelperMarker(pattern.xOrigin+pattern.radius,pattern.yOrigin,"radius", "arrow-double");
                    this.addHelperMarker(pattern.xOrigin-pattern.radius,pattern.yOrigin,"radius", "arrow-double", );
                    this.addHelperMarker(pattern.xOrigin,pattern.yOrigin+pattern.radius,"radius", "arrow-double", 90);
                    this.addHelperMarker(pattern.xOrigin,pattern.yOrigin-pattern.radius,"radius", "arrow-double", 90);
                    break;
                case "Ellipse":
                    let vectorFromCenter = PointOperations.trimVectorLength([0,-pattern.xRadius], pattern.yRadius + this.rotationMarkerDistanceFromPattern);
                    let rotationMarkerPoint = [pattern.xOrigin + vectorFromCenter[0], pattern.yOrigin + vectorFromCenter[1]];
                    this.addHelperMarker(...rotatePoint(rotationMarkerPoint),"rotate", "arrow-rotate", pattern.rotation);
                    this.addHelperMarker(...pattern.top(),"yRadius", "arrow-double", pattern.rotation+90);
                    this.addHelperMarker(...pattern.right(),"xRadius", "arrow-double", pattern.rotation);
                    this.addHelperMarker(...pattern.left(),"xRadius", "arrow-double", pattern.rotation);
                    this.addHelperMarker(...pattern.bottom(),"yRadius", "arrow-double", pattern.rotation+90);
                    break;
                case "Line":
                    let angle = PointOperations.angle(pattern.vector);
                    this.addHelperMarker(pattern.xOrigin,pattern.yOrigin,"start","point", angle);
                    this.addHelperMarker(pattern.xEnd,pattern.yEnd,"end", "point", angle);
                    let widthMarkerPos = PointOperations.orthogonalIcon(pattern.xOrigin,pattern.yOrigin,pattern.xEnd,pattern.yEnd, pattern.width/2 +10, "top");
                    this.addHelperLine(PointOperations.halfway(pattern.xOrigin, pattern.xEnd),PointOperations.halfway(pattern.yOrigin, pattern.yEnd),widthMarkerPos[0],widthMarkerPos[1]);
                    this.addHelperMarker(...widthMarkerPos,"width","arrow-double", angle);
                    break;
                case "Path":
                    this.addHelperMarker(...rotatePoint(PointOperations.orthogonalIcon(pattern.boundingRect.x,pattern.boundingRect.y,pattern.boundingRect.x + pattern.boundingRect.width,pattern.boundingRect.y, this.rotationMarkerDistanceFromPattern, "top")),"rotate", "arrow-rotate", pattern.rotation);
                    for(let index in pattern.points){
                        index = parseInt(index);
                        let point = pattern.points[index];
                        let rotatedPoint = rotatePoint([point.x,point.y]);
                        //normal point
                        this.addHelperMarker(...rotatedPoint,index,"point");
                        //for extra point
                        let lastPoint;
                        //if extra point is Quadratic
                        if(["Q"].indexOf(point.method) !== -1){
                            //add lines
                            if(index === 0){
                                lastPoint = {
                                    x:pattern.xOrigin,
                                    y:pattern.yOrigin
                                }
                            }else{
                                lastPoint = pattern.points[index-1];
                            }
                            let rotatedLastPoint = rotatePoint([lastPoint.x,lastPoint.y]);
                            let rotatedExtraPoint = rotatePoint([point.extraX, point.extraY]);
                            this.addHelperLine(...rotatedLastPoint, ...rotatedExtraPoint);
                            this.addHelperLine(...rotatedPoint,...rotatedExtraPoint);
                            //add marker
                            this.addHelperMarker(...rotatedExtraPoint,"extra"+index,"curve");
                        }else{//if extra point is not Quadratic
                            //first point is Origin
                            if(index === 0){
                                lastPoint = {
                                    x:pattern.xOrigin,
                                    y:pattern.yOrigin
                                };
                            //then points from points array
                            }else{
                                lastPoint = pattern.points[index-1];
                            }
                            let rotatedLastPoint = rotatePoint([lastPoint.x,lastPoint.y]);
                            this.addHelperMarker(PointOperations.halfway(rotatedPoint[0],rotatedLastPoint[0]),PointOperations.halfway(rotatedPoint[1],rotatedLastPoint[1]),"extra"+index,"curve");
                        }
                    }
                    break;
                default:
                    break;
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
                if(["Rect","Ellipse","Path"].indexOf(pattern.constructor.name) != -1){//multi selection
                    if(editedObject.memorize == "rotate"){
                        let angle = PointOperations.angle([this.relX(event.clientX,0,undefined,1) - pattern.center[0],this.relY(event.clientY,0,undefined,1) - pattern.center[1]]);
                        changes = {
                            rotation: UniversalOps.snap(angle, 3, [0, 45, 90, 135, 180, 225, 270, 315], true, 360)
                        }
                        this.currProj().alterPattern(pattern, changes);
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
                        if(editedObject.memorize = "radius"){
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
                                width: 2* PointOperations.distance(PointOperations.halfway(pattern.xOrigin, pattern.xEnd),PointOperations.halfway(pattern.yOrigin, pattern.yEnd), this.relX(event.clientX,0,1,1), this.relY(event.clientY,0,1,1)) - 20
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
                    this.currProj().frame().infoBoxManager.updateBox(pattern);
                }
                break;
            case "dragPattern":
                let newOriginX = this.relX(event.clientX,(this.state.mouseDownInfo.relToPatternOriginX));
                let newOriginY = this.relY(event.clientY,(this.state.mouseDownInfo.relToPatternOriginY));
                if (newOriginX !== pattern.xOrigin || newOriginY !== pattern.yOrigin) {
                    this.clearViewportUI();
                    switch (pattern.constructor.name) {
                        case "Rect":
                            pattern.translateTo(newOriginX, newOriginY);
                            break;
                        case "Circle":
                            pattern.translateTo(newOriginX, newOriginY);
                        break;
                        case "Ellipse":
                            pattern.translateTo(newOriginX, newOriginY);
                        break;
                        case "Line":
                            pattern.translateTo(newOriginX, newOriginY);
                        break;
                        case "Path":
                            pattern.translateTo(newOriginX, newOriginY);
                            break;
                        default:
                            break;
                    }
                    //repaint point and marker
                    this.prepareEdit(pattern);
                    if(!this.savePower){
                        this.currProj().frame().infoBoxManager.updateBox(pattern);
                    }
                }
                break;
            default:
                //edit, but no further action
                break;
        }
    }
    finishNewPattern(event, to){
        if(!this.invalidPattern(event)){
            this.infoBoxManager().newBox(this.focusedPattern());
            this.saveToHistory();
            this.setDrawingType("none");
            this.startEdit(this.focusedPattern());
            
            //TODO: remove filler box
        }else{
            this.focus();
            this.setDrawingType(to);
        }
    }
    /**
     * Checks if pattern origin equals last position input. If that is true the last pattern is removed and an alert is shown.
     * @param {MouseEvent} event last mouse event
     * @returns true if invalid pattern is detected
     */
    invalidPattern(event){
        if(this.relX(event.clientX) == this.focusedPattern().xOrigin && this.relY(event.clientY) == this.focusedPattern().yOrigin){
            this.removePattern(this.focusedPattern());
            alert("Halte die Maus gedrückt und ziehe sie anschließend, um eine Form zu erstellen.");
            return true;
        }
        //check if height and width are not 0
        if(["Rect","Ellipse"].indexOf(this.focusedPattern().constructor.name) != -1){
            if(this.relX(event.clientX) == this.focusedPattern().xOrigin || this.relY(event.clientY) == this.focusedPattern().yOrigin){
                this.removePattern(this.focusedPattern());
                alert("Diese Form kannst du so nicht malen");
                return true;
            }
        }
        return false;
    }
    newProject(){
        let newProject = new Project(this.environment.layout.elementOverview, this);
        newProject.init();
        this.drawingViewport.append(newProject.container);
        this.activeProjects.push(newProject);
        //TEMP: does not work with multiple projects
        this.saveToHistory();
    }
    closeContextMenu(){
        if(this.contextMenu != undefined){
            this.contextMenu.close();
            delete this.contextMenu;
        }
    }
    openContextMenu(event){
        this.stopEdit();
        this.closeContextMenu();
        this.contextMenu = new ContextMenu(event.clientX, event.clientY, this.environment.layout.viewport);
        if(event.target.parentElement.getAttribute("role") === "main"){
            this.startEdit(this.patternById(event.target.parentElement.id));
            let options = [
                {
                    label:"ausschneiden",
                    clickHandler:()=>{this.changeView("mask");this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"nach Vorne",
                    clickHandler:()=>{this.toTop(this.focusedPattern());this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"nach Hinten",
                    clickHandler:()=>{this.toBottom(this.focusedPattern());this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"duplizieren",
                    clickHandler:()=>{this.duplicateCurrentPattern();this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"vertikal spiegeln",
                    clickHandler:()=>{this.mirrorCurrentPatternVertical();this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"horizontal spiegeln",
                    clickHandler:()=>{this.mirrorCurrentPatternHorizontal();this.closeContextMenu();},
                    icon:"B"
                },{
                    label:"löschen",
                    clickHandler:()=>{this.removePattern(this.focusedPattern());this.saveToHistory();this.closeContextMenu();},
                    icon:"B"
                }
            ];
            this.contextMenu.deploy(options);
        }
    }
    mirrorCurrentPatternVertical(){
        console.log(this.focusedPattern());
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
        let id = this.currProj().newPattern(type,this.relX(x),this.relY(y));
        return id;
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
    /**
     * DOES NOT SAVE TO HISTORY
     * @param {Number} id 
     */
    removePattern(pattern){
        this.stopEdit();
        this.currProj().frame().remove(pattern);
        
    }
    reverseLastAction(){
        this.focus();
        this.setDrawingType("none");
        this.currProj().frame().history.reverseLast();
    }
    reInitLastReverse(){
        this.focus();
        this.setDrawingType("none");
        this.currProj().frame().history.reInitLast();
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
                    //ui
                    this.selectRadio(this.environment.control.view.arange, this.environment.control.view);
                    break;
                case "mask":
                    if(editPossible){
                        if(focusedPattern.allowMask){
                            this.state.view = view;
                            this.currProj().setContext(this.currProj().currentFrame);
                            this.currProj().setFrame(focusedPattern.maskLayer);
                            //ui
                            this.selectRadio(this.environment.control.view.mask, this.environment.control.view);
                            
                        }else{
                            alert("Cannot mask this pattern");
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
    startEdit(pattern){
        if(this.currProj().frame().boundId != pattern.id){
            this.state.currentAction = "edit0";
            this.focus(pattern);
            this.prepareEdit(pattern);
            this.currProj().repaint();
        }else{
            alert("Du kannst diese Form nicht im Ausschneidemodus bearbeiten");
        }
    }
    stopEdit(){
        this.currProj().frame().stopEdit();
        this.state.currentAction = "none";
        this.currProj().repaint();
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
    clearViewportUI(){
        this.currProj().frame().clearUI();
    }
    duplicate(pattern){
        let dup = PatternManipulator.duplicate(pattern);
        dup.id = IconCreatorGlobal.id();
        this.currProj().frame().addPattern(dup);
        dup.translateTo(dup.xOrigin+20, dup.yOrigin+20);
        this.infoBoxManager().newBox(dup);
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
        this.currProj().frame().saveToHistory();
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
        if(["rect0","circle0","ellipse0","line0","path0"].indexOf(type) !== -1){
            this.setCursor(this.drawingViewport,"crosshair");
        }else{
            this.setCursor(this.drawingViewport, "default");
        }
        if(this.state.currentAction == "edit0"){
            this.stopEdit();
        }
        //ui changes
        Object.keys(this.environment.control.editSVG).forEach(key => {
            this.environment.control.editSVG[key].removeAttribute("selected");
        });
        switch (type) {
            case "none":
                this.environment.control.editSVG.cursor.setAttribute("selected","true");
                break;
            case "rect0":
                this.environment.control.editSVG.newRect.setAttribute("selected","true");
                break;
            case "circle0":
                this.environment.control.editSVG.newCircle.setAttribute("selected","true");
                break;
            case "ellipse0":
                this.environment.control.editSVG.newEllipse.setAttribute("selected","true");
                break;
            case "line0":
                this.environment.control.editSVG.newLine.setAttribute("selected","true");
                break;
            case "path0":
                this.environment.control.editSVG.newPath.setAttribute("selected","true");
                break;
            default:
                break;
        }
        this.state.currentAction = type;
    }
    closestMarker(x,y){
        let min = {
            distance:this.detectMouseOnMarkerDistance,
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
    outputHTML(){
        return this.currProj().outputHTML();
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
    debugFrame(){
        return this.currProj().frame();
    }
}