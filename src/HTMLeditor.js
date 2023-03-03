import IconCreatorGlobal from "./IconCreatorGlobal";
import CustomColorInput from "./components/CustomColorInput";
import Project from "./Project";

import UniversalOps from "./shared/UniversalOps";
import PointOperations from "./shared/PointOperations";
import PatternManipulator from "./shared/patternManipulator";

import Outline from "./helperPatterns/Outline";
import Marker from "./helperPatterns/marker";
import UILine from "./helperPatterns/UILine";
import ContextMenu from "./uiElements/ContextMenu";
import MenuButton from "./uiElements/MenuButton";
import Banner from "./components/Banner.js";
import RotateDisplay from "./uiElements/RotateDisplay";

import ExportWindow from "./uiElements/ExportWindow";
import ConfirmWindow from "./uiElements/ConfirmWindow";
import TouchInputAdapter from "./shared/TouchInputAdapter";

export default class HTMLeditor{

    activeProjects = new Array();
    toolBanner;

    detectMouseOnMarkerDistance = 8;
    rotationMarkerDistanceFromPattern = 20;//TODO remove after relocation

    minCoordinate = -2048;
    editOpacity = 0.8;
    
    keepHistory = true;
    exclusivView = false;

    colorSchemeLight = true;
    preventBrowsershortcuts = true;

    state = {
        currentAction:"none",
        editedObject:undefined,
        mouseDownInfo:undefined,
        view:"arange",
        currentProject: 0,
        gridsize: 1,
        draggingInfo: undefined
    }

    constructor(environment){
        this.environment = environment;
        //setup viewport
        this.environment.layout.viewport.style.cssText = "position:relative;overflow:hidden";
        this.drawingViewport = this.environment.layout.resultViewport;
        this.drawingViewport.style.cssText = "height:512px;width:512px;";
        //init control
        this.environment.control.editSVG.cursor.addEventListener("click",() => {
            this.focus();
            this.setDrawingType("none");
        });
        this.environment.control.editSVG.clearAll.addEventListener("click",()=>{
            let onAccept = ()=>this.clearProject();
            let onReject = ()=>{return;}
            let message = "Everything will be cleared. A recovery will not be possible.";
            new ConfirmWindow(this.environment.layout.overlay, "New Project",message,onAccept, onReject);
        });
        //pattern creation
        for(let i in this.environment.config.patterns){
            let item = this.environment.config.patterns[i];
            if(item.startPaintButton){
                item.startPaintButton.addEventListener("mousedown",() => {
                    this.setDrawingType("dragOut");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map(item=>{return item.startPaintButton}),this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
                item.startPaintButton.addEventListener("mouseup",() => {
                    this.setDrawingType("clickedPaintPattern");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map(item=>{return item.startPaintButton}),this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
            }
        }
        //meta edits
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

        this.environment.control.meta.moreOptions.addEventListener("click",()=>{
            this.addReferenceImage();
        });
        //setup for keyboard shortcuts
        this.environment.document.addEventListener('keydown', event=>{
            this.blockKeys(event);
        });
        this.environment.document.addEventListener('keyup', event=>{
            this.keyup(event);
        });
        //init mouse & touch events
        this.environment.layout.viewport.addEventListener("contextmenu", event => {
            event.preventDefault();
            this.openContextMenu(event);
            return false;
        },false);
        this.environment.layout.viewport.addEventListener("mousemove",event => {this.mouseMoved(event);});
        this.environment.layout.viewport.addEventListener("touchmove",event => {
            console.log("Touch move");
            this.mouseMoved(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event));
            event.preventDefault();
        });
        this.environment.layout.viewport.addEventListener("mousedown",event => {this.mouseDown(event);});
        this.environment.layout.viewport.addEventListener("touchstart",event => {
            console.log("Touch start");
            this.mouseDown(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event));
        });
        this.environment.layout.viewport.addEventListener("mouseup",event => {this.mouseUp(event);});
        this.environment.layout.viewport.addEventListener("touchend",event => {
            console.log("Touch end");
            this.mouseUp(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event));
        });
        this.environment.layout.viewport.addEventListener("touchcancel",event => {
            console.log("Touch cancel");
            this.mouseUp(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event));
        });
        this.environment.layout.viewport.addEventListener("dblclick",event => {this.doubleclick(event);});
        //resize listeners
        this.environment.window.addEventListener("resize",()=>{
            this.currProj().drawBg();
        }
        );
    }
    mouseDown(event){
        this.closeContextMenu();
        this.setMouseInfo(event);
        if(event.which === 1){
            //if new drawing type is selected
            if(["edit","activePaintPattern"].indexOf(this.state.currentAction) == -1){
                this.clearViewportUI();
            }
            let patternRole = event.target.parentElement.getAttribute("role");
            switch (this.state.currentAction) {
                case "clickedPaintPattern":
                    this.state.currentAction = "mousedownPaintPattern";
                    break;
                case "none":
                    //if pattern is on mouse -> start editing
                    if(patternRole === "main" || patternRole === "reference"){
                        //dont focus main pattern on mask frame
                        if(this.currProj().frame().boundId != event.target.parentElement.id){
                            this.startEdit(this.patternById(event.target.parentElement.id));
                            this.setDraggingInfo(this.focusedPattern(), event);
                            this.state.currentAction = "dragPattern";
                        }else{
                            console.warn("You cannot edit the main pattern in carve out mode!");
                        }
                    }
                    break;
                //edit
                case "edit":
                    let closestMarker = this.closestMarker(this.relX(event.clientX,0,undefined,1),this.relY(event.clientY,0,undefined,1));
                    //start dragging marker
                    if (closestMarker.distance < this.detectMouseOnMarkerDistance) {
                        this.state.editedObject = closestMarker.marker;
                        this.state.currentAction = "dragMarker";
                    }else if(event.target.parentElement.id == this.focusedPattern().id){//start dragging pattern
                        this.setDraggingInfo(this.patternById(event.target.parentElement.id), event);
                        this.state.currentAction = "dragPattern";
                    }else if(patternRole === "main" || patternRole === "reference"){//not focused pattern is clicked but pattern
                        //dont focus main pattern on mask frame
                        if(this.currProj().frame().boundId != event.target.parentElement.id){
                            this.startEdit(this.patternById(event.target.parentElement.id));
                            this.setDraggingInfo(this.focusedPattern(), event);
                            this.state.currentAction = "dragPattern";
                        }
                    }else{//do nothing
                        this.state.currentAction = "edit";
                    }
                    break;
            }
        }
    }
    mouseMoved(event){
        if(this.state.currentAction !== "none"){
            let pattern = this.focusedPattern();
            switch (this.state.currentAction) {
                //dragged from new pattern
                case "dragOut":
                    pattern = new this.state.paintPatternClass();
                    pattern.color = this.currProj().getColor();
                    this.currProj().frame().processAndAppend(pattern);
                    this.currProj().frame().newBox(pattern);
                    //center pattern on mouse
                    pattern.translateTo(this.relX(event.clientX),this.relY(event.clientY));
                    pattern.initialDefaultTranslation();
                    this.focus(pattern);
                    this.startEdit(pattern);
                    this.setDraggingInfo(pattern, event);
                    this.state.currentAction = "dragPattern";
                    this.currProj().repaint(pattern);
                    break;
                case "mousedownPaintPattern"://if mousedown after pattern selection and move -> active paint mode
                    this.state.currentAction = "activePaintPattern";
                    break;
                case "activePaintPattern":
                    if(this.focusedPattern() == undefined){
                        //create new pattern
                        pattern = new this.state.paintPatternClass();
                        console.log(pattern);
                        pattern.color = this.currProj().getColor();
                        this.currProj().frame().processAndAppend(pattern);
                        this.currProj().frame().newBox(pattern);
                        let changes = pattern.startActiveDraw(this.relX(event.clientX),this.relY(event.clientY),this.relX(event.clientX, 0, undefined,1),this.relY(event.clientY, 0, undefined,1));
                        this.currProj().alterPattern(pattern, changes);
                        this.focus(pattern);
                    }else{
                        this.clearViewportUI();
                        let changes = pattern.movedActiveDraw(this.relX(event.clientX),this.relY(event.clientY),this.relX(event.clientX, 0, undefined,1),this.relY(event.clientY, 0, undefined,1));
                        this.currProj().alterPattern(pattern, changes);
                        this.addHelperOutline(pattern);
                        //add markers
                        let markers = pattern.activeDrawMarkers();
                        for(let i in markers){
                            this.addHelperMarker(...markers[i]);
                        }
                    }
                    this.currProj().repaint(pattern);
                    break;
                case "dragPattern":
                    this.currProj().frame().setOpacity(this.editOpacity);
                    this.adjustPatternToOther(pattern, this.state.editedObject, event);
                    this.currProj().repaint(pattern);
                    break;
                case "dragMarker":
                    this.currProj().frame().setOpacity(this.editOpacity);
                    this.adjustPatternToOther(pattern, this.state.editedObject, event);
                    this.currProj().repaint(pattern);
                    break;
                default:
                    break;
            }
        }else{
            this.clearViewportUI();
            let role = event.target.parentElement.getAttribute("role");
            if(role === "main" || role === "reference"){
                //dont focus main pattern on mask frame
                if(this.currProj().frame().boundId != event.target.parentElement.id){
                    this.addHelperOutline(this.patternById(event.target.parentElement.id));
                }
            }
        }
    }
    mouseUp(event){
        this.closeContextMenu();
        this.clearViewportUI("rotationDisplay");
        if(event.which === 1){
            let pattern = this.focusedPattern();
            let xPrecise = this.relX(event.clientX,0,undefined,1);
            let yPrecise = this.relY(event.clientY,0,undefined,1);
            let x = this.relX(event.clientX);
            let y = this.relY(event.clientY);
            let patternRole = event.target.parentElement.getAttribute("role");
            switch (this.state.currentAction) {
                case "mousedownPaintPattern":
                    pattern = new this.state.paintPatternClass();
                    pattern.color = this.currProj().getColor();
                    this.currProj().frame().processAndAppend(pattern);
                    this.currProj().frame().newBox(pattern);
                    //center pattern on mouse
                    pattern.translateTo(this.relX(event.clientX),this.relY(event.clientY));
                    pattern.initialDefaultTranslation();
                    this.focus(pattern);
                    this.startEdit(pattern);
                    this.setDraggingInfo(pattern, event);
                    this.state.currentAction = "edit";
                    break;
                case "activePaintPattern":
                    let changes = pattern.releaseActiveDraw(this.relX(event.clientX),this.relY(event.clientY),this.relX(event.clientX, 0, undefined,1),this.relY(event.clientY, 0, undefined,1));//returns undefined if pattern is finished
                    if(changes == undefined){
                        this.clearViewportUI();
                        this.startEdit(pattern);
                    }else{
                        this.currProj().alterPattern(pattern, changes, true);
                        this.clearViewportUI();
                        this.addHelperOutline(pattern);
                        //add markers
                        let markers = pattern.activeDrawMarkers();
                        for(let i in markers){
                            this.addHelperMarker(...markers[i]);
                        }
                    }
                    break;
                //edit
                case "edit":
                    if(patternRole !== "main" && patternRole !== "reference"){
                        //stop edit on active element
                        this.stopEdit();
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
                    this.state.currentAction = "edit";
                    this.currProj().frame().updateInfoBox(pattern);
                    this.saveToHistory();
                    this.currProj().frame().setOpacity(1);
                    this.currProj().repaint(pattern);
                    break;
                case "dragPattern":
                    this.state.currentAction = "edit";
                    this.currProj().frame().updateInfoBox(pattern);
                    this.saveToHistory();
                    this.currProj().frame().setOpacity(1);
                    //only repaint if moved -> repaint stops doubleclick from working
                    if(this.relX(event.clientX,0,undefined,1) != this.state.draggingInfo.x || this.relY(event.clientY,0,undefined,1) != this.state.draggingInfo.y){
                        this.currProj().repaint(pattern);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    doubleclick(event){
        switch(this.state.currentAction){
            case "edit":
            case "none":
            //stop edit on active element
            this.stopEdit();
            //if pattern is clicked -> start editing
            if(event.target.parentElement.getAttribute("role") === "main"){
                //dont focus main pattern on mask frame
                if(this.currProj().frame().boundId != event.target.parentElement.id){
                    this.state.currentAction = "edit";
                    this.focus(this.patternById(event.target.parentElement.id));
                    this.focusedPattern().doubleclicked();
                    this.repaint(this.focusedPattern());
                    this.addHelperOutline(this.focusedPattern());
                }
            }
            break;
        }
    }
    addEditUI(pattern = this.focusedPattern()){
        if(["edit","dragPattern","dragMarker"].indexOf(this.state.currentAction) != -1){
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
            this.addHelperOutline(pattern);
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
                //get changes that should be done to the pattern accordingly
                let changes = pattern.markerEdited(editedObject,this.state.gridsize, this.relX(event.clientX,0,undefined,1), this.relY(event.clientY,0,undefined,1));
                this.currProj().alterPattern(pattern, changes);
                this.addEditUI(pattern);
                //repaint point and marker and outline
                if(changes.rotation != undefined){
                    this.addHelperRotation(pattern);
                }
                this.currProj().frame().updateInfoBox(pattern);
                break;
            case "dragPattern":
                let newOriginX = this.relX(event.clientX,(this.state.draggingInfo.relToPatternOriginX));
                let newOriginY = this.relY(event.clientY,(this.state.draggingInfo.relToPatternOriginY));
                if (newOriginX !== pattern.xOrigin || newOriginY !== pattern.yOrigin) {
                    this.clearViewportUI();
                    pattern.translateTo(newOriginX, newOriginY);
                    //repaint point and marker
                    this.addEditUI(pattern);
                    this.currProj().frame().updateInfoBox(pattern);
                }
                break;
            default:
                //edit, but no further action
                break;
        }
    }
    setDraggingInfo(editedObject, event){
        this.state.editedObject = editedObject;
        let draggingInfo = {
            x:this.relX(event.clientX,0,undefined,1),
            y:this.relY(event.clientY,0,undefined,1),
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
    newProject(){
        let newProject = new Project(this.environment.layout.elementOverview, this);
        newProject.init(this.environment.layout.viewport);
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
    defaultOptions(pattern){
        if(pattern.isReference){
            return [{
                label:"delete",
                clickHandler:()=>{this.removeCurrentPattern();this.closeContextMenu();},
                icon:"img/sys_trash_icon.svg",
                type:"general"
            }];
        }
        let options = [];
        if(!pattern.isMask && pattern.allowMask){
            options.push({
                label:"carve out",
                clickHandler:()=>{this.changeView("mask");this.closeContextMenu();},
                icon:"img/sys_carve_out_icon.svg",
                type:"general"
            });
        }
        options.push({
            label:"duplicate",
            clickHandler:()=>{this.duplicateCurrentPattern();this.closeContextMenu();},
            icon:"img/sys_duplicate_icon.svg",
            type:"general"
        },{
            label:"flip",
            clickHandler:()=>{this.mirrorCurrentPatternVertical();this.closeContextMenu();},
            icon:"img/sys_flip_icon.svg",
            type:"general"
        },{
            label:"flip",
            clickHandler:()=>{this.mirrorCurrentPatternHorizontal();this.closeContextMenu();},
            icon:"img/sys_flip_icon.svg",
            type:"general",
            transform:"rotate(90deg)"
        },{
            label:"delete",
            clickHandler:()=>{this.removeCurrentPattern();this.closeContextMenu();},
            icon:"img/sys_trash_icon.svg",
            type:"general"
        });
        return options;
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
                options.push(...this.defaultOptions(this.focusedPattern()));
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
            console.warn("No context menu in this area");
            return;
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
            this.addEditUI();
        }
    }
    mirrorCurrentPatternHorizontal(){
        if(this.focusedPattern() != undefined){
            this.focusedPattern().mirrorHorizontally();
            this.currProj().repaint(this.focusedPattern());
            this.saveToHistory();
            this.clearViewportUI();
            this.addEditUI();
        }
    }
    duplicateCurrentPattern(){
        if(this.focusedPattern() != undefined){
            this.duplicate(this.focusedPattern());
            this.saveToHistory();
        }
    }
    removeCurrentPattern(){
        if(this.focusedPattern() != undefined){
            this.removePattern(this.focusedPattern());
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
    addHelperLine(x,y,endX,endY,dashArray){
        let uiline = new UILine(this.drawingViewport, x,y,endX,endY,dashArray);
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
        this.currProj().remove(pattern);
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
            let editPossible = (this.state.currentAction == "edit")?true:false;
            this.stopEdit();
            this.setDrawingType("none");
            switch (view) {
                case "arange":
                    this.state.view = view;
                    this.currProj().setFrame(this.currProj().keyframes[0]);
                    this.saveToHistory();
                    break;
                case "mask":
                    if(editPossible){
                        if(focusedPattern.allowMask){
                            this.state.view = view;
                            this.currProj().switchToMask(focusedPattern);
                            //ui
                            let callback = ()=>{this.changeView("arange")};
                            let headline = IconCreatorGlobal.el("div","<img src='img/sys_carve_out_icon.svg'>Carve out mode","title");
                            let banner = new Banner(headline, "Quit", callback);
                            banner.addTo(this.environment.layout.container);
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
        if(this.focusedPattern()){
            this.stopEdit();
        }
        this.setDrawingType("none");
        this.state.currentAction = "edit";
        this.focus(pattern);
        this.addEditUI(pattern);
        if(this.exclusivView && !pattern.isReference){
            //hide all patterns that are not selected
            for(let id in this.currProj().frame().patterns){
                if(id != this.focusedPattern().id){
                    this.currProj().frame().patterns[id].display = false;
                }
            }
            this.currProj().frame().updateInfoBox();
        }
        //edit banner
        if(this.toolBanner == undefined){
            let buttonWrapper = IconCreatorGlobal.el("div","","tool-buttons");
            let options = this.defaultOptions(pattern);
            for(let i = 0;i < options.length; i++){
                let button = new MenuButton(options[i].label, options[i].icon, options[i].transform, options[i].clickHandler);
                if(options[i].type == "general"){
                    button.addTo(buttonWrapper);
                }
            }
            let banner = new Banner(buttonWrapper);
            banner.addTo(this.environment.layout.container);
            this.toolBanner = banner;
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
        if(this.toolBanner){
            this.toolBanner.close();
            delete this.toolBanner;
        }
        this.focus();
        this.currProj().frame().stopEdit();
        this.state.currentAction = "none";
        this.repaint();
    }
    patternById(id){
        return this.currProj().patternById(id);
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
        if(this.focusedPattern()){
            this.focusedPattern().lostFocus();
        }
        this.currProj().frame().focus(pattern);
        if(pattern){
            pattern.gotFocus();
        }
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
                targetColor = "#3b3b3b";
                this.colorSchemeLight = false;
                break;
        }
        document.querySelector(':root').style.setProperty('--viewport-background', targetColor);
        this.currProj().drawBg();
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
    setDrawingType(type){
        this.closeContextMenu();
        if(["rect0","circle0","ellipse0","line0","path0"].indexOf(type) !== -1){
            this.setCursor(this.drawingViewport,"crosshair");
        }else{
            this.setCursor(this.drawingViewport, "default");
        }
        if(this.state.currentAction == "edit"){
            this.stopEdit();
        }
        if(type == "none"){
            UniversalOps.selectRadio(this.environment.control.editSVG.cursor, [...this.environment.config.patterns.map(item=>{return item.startPaintButton})]);
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
        this.currProj().bgGridsize = parseInt(this.state.gridsize);
        this.currProj().drawBg();
    }
    setPaintColor(color = "#000000"){
        this.currProj().setColor(color);
    }
    setCursor(element,style = "cursor"){
        element.style.cursor = style;
    }
    repaint(pattern){
        this.currProj().repaint(pattern);
        this.updateHistoryButtons();
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
    translateFocussedPattern(x = 0, y = 0){
        let pattern = this.focusedPattern();
        if(pattern){
            pattern.translateTo(pattern.xOrigin + x, pattern.yOrigin + y);
            //repaint point and marker
            this.currProj().frame().updateInfoBox(pattern);
            this.clearViewportUI(pattern);
            this.addEditUI(pattern);
            this.currProj().repaint(pattern);
        }
    }
    addReferenceImage(){
        let callback = image =>{
            if(image){
                this.currProj().addReferenceImage(image);
            }else{
                console.warn("No image given");
            }
        }
        ImageProcessor.requestImage(callback);
    }
    clearProject(){
        this.clearViewportUI();
        this.currProj().reset();
        this.repaint();
    }
    exportFile(){
        this.stopEdit();
        this.preventBrowsershortcuts = false;
        let callback = ()=>{
            this.preventBrowsershortcuts = true;
        }
        let exportWindow = new ExportWindow(this.environment.layout.overlay, this.currProj(), undefined , callback);
    }
    blockKeys(event){
        if(this.preventBrowsershortcuts){
            if([68, 90].indexOf(event.keyCode) !== -1){
                event.preventDefault();
            }
        }
    }
    /**
     * Is triggered on key up events. If the patterns keypress function returns a truthy value, the input is not passed to the hotkey function.
     * @param {Keyboard Event} event 
     */
    keyup(event){
        let blockHotkeys = false;
        if(this.focusedPattern()){
            blockHotkeys = this.focusedPattern().keypress(event);
            if(this.focusedPattern().repaintOnKeyUp){
                this.repaint(this.focusedPattern());
            }
        }
        if(!blockHotkeys){
            this.hotkey(event); 
        }
    }
    hotkey(event){
        this.closeContextMenu();
        if(event.keyCode == 8){
            event.preventDefault();
            this.removeCurrentPattern();
        }else if(event.keyCode == 39){//arror right
            this.translateFocussedPattern(this.state.gridsize);
            this.saveToHistory();
        }else if(event.keyCode == 37){//arror left
            this.translateFocussedPattern(-this.state.gridsize);
            this.saveToHistory();
        }else if(event.keyCode == 38){//arrow up
            this.translateFocussedPattern(0, -this.state.gridsize);
            this.saveToHistory();
        }else if(event.keyCode == 40){//arrow down
            this.translateFocussedPattern(0, this.state.gridsize);
            this.saveToHistory();
        }
        if(event.ctrlKey){//conrolKey pressed -> action
            if(event.keyCode === 68){//d
                event.preventDefault();
                this.duplicateCurrentPattern();
            }else
            if(event.keyCode === 90){//z
                event.preventDefault();
                if(event.shiftKey){
                    //ctrl+shift+z
                    this.reInitLastReverse();
                }else{
                    this.reverseLastAction();
                }
            }
        }
    }
}