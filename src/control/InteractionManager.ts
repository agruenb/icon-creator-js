import { EditorState } from "../model/EditorState";
import { gAnalyticsTrackEvent } from "../lib/googleAnalytics";

export class InteractionManager {
    editor: any;

    constructor(editor: any) {
        this.editor = editor;
    }

    handleMouseDown(event: MouseEvent) {
        this.editor.closeContextMenu();
        this.setMouseInfo(event);
        if (event.which === 1) {
            //if new drawing type is selected
            if (["edit", "activePaintPattern"].indexOf(this.editor.state.currentAction) == -1) {
                this.editor.clearViewportUI();
            }
            let clickedElement = this.editor.clickedElement(event);
            if (!clickedElement) return; // Guard against null

            let patternRole = clickedElement.parentElement.getAttribute("role");
            switch (this.editor.state.currentAction) {
                case "clickedPaintPattern":
                    this.editor.state.setAction("mousedownPaintPattern");
                    break;
                case "none":
                    //if pattern is on mouse -> start editing
                    if (patternRole === "main" || patternRole === "reference") {
                        //dont focus main pattern on mask frame
                        if (this.editor.currProj().frame().boundId != clickedElement.parentElement.id) {
                            this.editor.startEdit(this.editor.patternById(clickedElement.parentElement.id));
                            this.setDraggingInfo(this.editor.focusedPattern(), event);
                            this.editor.state.setAction("dragPattern");
                        } else {
                            console.warn("You cannot edit the main pattern in carve out mode!");
                        }
                    }
                    break;
                //edit
                case "edit":
                    let closestMarker = this.editor.closestMarkerToMouse(event);
                    //start dragging marker
                    if (closestMarker.distance < this.editor.detectMouseOnMarkerDistance) {

                        this.editor.state.editedObject = closestMarker.marker;
                        this.editor.state.setAction("dragMarker");
                    } else if (clickedElement.parentElement.id == this.editor.focusedPattern().id) {
                        //start dragging pattern
                        this.setDraggingInfo(this.editor.patternById(clickedElement.parentElement.id), event);
                        this.editor.state.setAction("dragPattern");
                    } else if (patternRole === "main" || patternRole === "reference") {
                        //not the focused pattern is clicked but another pattern
                        //dont focus main pattern on mask frame
                        if (this.editor.currProj().frame().boundId === clickedElement.parentElement.id) {
                            return;
                        }
                        this.editor.startEdit(this.editor.patternById(clickedElement.parentElement.id));
                        this.setDraggingInfo(this.editor.focusedPattern(), event);
                        this.editor.state.setAction("dragPattern");
                    } else {//do nothing
                        this.editor.state.setAction("edit");
                    }
                    break;
            }
        }
    }

    handleMouseMove(event: MouseEvent) {
        if (this.editor.state.currentAction !== "none") {
            let pattern = this.editor.focusedPattern();
            switch (this.editor.state.currentAction) {
                //dragged from new pattern
                case "dragOut":
                    pattern = new this.editor.state.paintPatternClass();
                    pattern.color = this.editor.currProj().getColor();
                    this.editor.currProj().frame().processAndAppend(pattern);
                    this.editor.currProj().frame().newBox(pattern);
                    gAnalyticsTrackEvent("create_pattern", {
                        method: "drag_out",
                        type: this.editor.state.paintPatternClass.name
                    });
                    //center pattern on mouse
                    pattern.translateTo(this.editor.relX(event.clientX), this.editor.relY(event.clientY));
                    pattern.initialDefaultTranslation();
                    this.editor.focus(pattern);
                    this.editor.startEdit(pattern);
                    this.setDraggingInfo(pattern, event);
                    this.editor.state.setAction("dragPattern");
                    this.editor.currProj().repaint(pattern);
                    break;
                case "mousedownPaintPattern"://if mousedown after pattern selection and move -> active paint mode
                    this.editor.state.setAction("activePaintPattern");
                    break;
                //a new pattern is painted in the editor
                case "activePaintPattern":
                    if (this.editor.focusedPattern() == undefined) {
                        //create new pattern
                        pattern = new this.editor.state.paintPatternClass();
                        pattern.color = this.editor.currProj().getColor();
                        this.editor.currProj().frame().processAndAppend(pattern);
                        this.editor.currProj().frame().newBox(pattern);
                        console.log(this.editor.state.paintPatternClass);
                        gAnalyticsTrackEvent("create_pattern", {
                            method: "paint_active",
                            type: this.editor.state.paintPatternClass.name
                        });
                        let changes = pattern.startActiveDraw(this.editor.relX(event.clientX), this.editor.relY(event.clientY), this.editor.relX(event.clientX, 0, undefined, 1), this.editor.relY(event.clientY, 0, undefined, 1));
                        this.editor.currProj().alterPattern(pattern, changes);
                        this.editor.focus(pattern);
                    } else {
                        this.editor.clearViewportUI();
                        let changes = pattern.movedActiveDraw(this.editor.relX(event.clientX), this.editor.relY(event.clientY), this.editor.relX(event.clientX, 0, undefined, 1), this.editor.relY(event.clientY, 0, undefined, 1));
                        this.editor.currProj().alterPattern(pattern, changes);
                        this.editor.addHelperOutline(pattern);
                        //add markers
                        let markers = pattern.activeDrawMarkers();
                        for (let i in markers) {
                            this.editor.addHelperMarker(...markers[i]);
                        }
                        //adjust marker size when mouse is close
                        let markerData = this.editor.closestMarkerToMouse(event);
                        if (markerData.distance < this.editor.detectMouseOnMarkerDistance) {
                            markerData.marker.scale = this.editor.markerScaleOnMouseHover;
                            markerData.marker.updateContainer();
                        }
                    }
                    this.editor.currProj().repaint(pattern);
                    break;
                case "dragPattern":
                    //mouse is on a pattern that is being dragged
                    this.editor.currProj().frame().setOpacity(this.editor.editOpacity);
                    this.adjustPatternToOther(pattern, this.editor.state.editedObject, event);
                    this.editor.currProj().repaint(pattern);
                    break;
                case "dragMarker":
                    //a marker is being dragged
                    this.editor.currProj().frame().setOpacity(this.editor.editOpacity);
                    this.adjustPatternToOther(pattern, this.editor.state.editedObject, event);
                    this.editor.currProj().repaint(pattern);
                    break;
                case "edit":
                    //adjust marker size when mouse is close
                    this.editor.clearViewportUI();
                    this.editor.addEditUI();//this creates the ui and directly adds it to the ui layer HTML element
                    let markerData = this.editor.closestMarkerToMouse(event);
                    if (markerData.distance < this.editor.detectMouseOnMarkerDistance) {
                        markerData.marker.scale = this.editor.markerScaleOnMouseHover;
                        markerData.marker.updateContainer();
                    }
                    this.editor.currProj().repaint(pattern);
                    break;
                default:
                    break;
            }
        } else {
            //no active action (state.currentActio == "none")
            this.editor.clearViewportUI();
            let clickedElement = this.editor.clickedElement(event);
            if (!clickedElement) return;

            let role = clickedElement.parentElement.getAttribute("role");
            if (role === "main" || role === "reference") {
                //dont focus main pattern on mask frame
                if (this.editor.currProj().frame().boundId === clickedElement.parentElement.id) {
                    return;
                }
                this.editor.addHelperOutline(this.editor.patternById(clickedElement.parentElement.id));
            }
        }
    }

    handleMouseUp(event: MouseEvent) {
        this.editor.closeContextMenu();
        this.editor.clearViewportUI("rotationDisplay");
        if (event.which === 1) {
            let pattern = this.editor.focusedPattern();
            let xPrecise = this.editor.relX(event.clientX, 0, undefined, 1);
            let yPrecise = this.editor.relY(event.clientY, 0, undefined, 1);
            let x = this.editor.relX(event.clientX);
            let y = this.editor.relY(event.clientY);
            let clickedElement = this.editor.clickedElement(event);

            let patternRole = clickedElement ? clickedElement.parentElement.getAttribute("role") : null;

            switch (this.editor.state.currentAction) {
                case "mousedownPaintPattern":
                    pattern = new this.editor.state.paintPatternClass();
                    pattern.color = this.editor.currProj().getColor();
                    this.editor.currProj().frame().processAndAppend(pattern);
                    this.editor.currProj().frame().newBox(pattern);
                    gAnalyticsTrackEvent("create_pattern", {
                        method: "click_canvas",
                        type: this.editor.state.paintPatternClass.name
                    });
                    //center pattern on mouse
                    pattern.translateTo(this.editor.relX(event.clientX), this.editor.relY(event.clientY));
                    pattern.initialDefaultTranslation();
                    this.editor.focus(pattern);
                    this.editor.startEdit(pattern);
                    this.setDraggingInfo(pattern, event);
                    this.editor.state.setAction("edit");
                    break;
                case "activePaintPattern":
                    //this used to be a bug. If there is no pattern, there was no click on the canvas to initiate activePaintPattern
                    if (pattern === undefined) {
                        pattern = new this.editor.state.paintPatternClass();
                        pattern.color = this.editor.currProj().getColor();
                        this.editor.currProj().frame().processAndAppend(pattern);
                        this.editor.currProj().frame().newBox(pattern);
                        gAnalyticsTrackEvent("create_pattern", {
                            method: "click_canvas",
                            type: this.editor.state.paintPatternClass.name
                        });
                        //center pattern on mouse
                        pattern.translateTo(this.editor.relX(event.clientX), this.editor.relY(event.clientY));
                        pattern.initialDefaultTranslation();
                        this.editor.focus(pattern);
                        this.editor.startEdit(pattern);
                        this.setDraggingInfo(pattern, event);
                        this.editor.state.setAction("edit");
                    } else {
                        let changes = pattern.releaseActiveDraw(this.editor.relX(event.clientX), this.editor.relY(event.clientY), this.editor.relX(event.clientX, 0, undefined, 1), this.editor.relY(event.clientY, 0, undefined, 1));//returns undefined if pattern is finished
                        if (changes == undefined) {
                            this.editor.clearViewportUI();
                            this.editor.startEdit(pattern);
                        } else {
                            this.editor.currProj().alterPattern(pattern, changes, true);
                            this.editor.clearViewportUI();
                            this.editor.addHelperOutline(pattern);
                            //add markers
                            let markers = pattern.activeDrawMarkers();
                            for (let i in markers) {
                                this.editor.addHelperMarker(...markers[i]);
                            }
                            //adjust marker size when mouse is close
                            let markerData = this.editor.closestMarkerToMouse(event);
                            if (markerData.distance < this.editor.detectMouseOnMarkerDistance) {
                                markerData.marker.scale = this.editor.markerScaleOnMouseHover;
                                markerData.marker.updateContainer();
                            }
                        }
                    }
                    break;
                //edit
                case "edit":
                    if (patternRole !== "main" && patternRole !== "reference") {
                        //stop edit on active element
                        this.editor.stopEdit();
                    }
                    break;
                case "dragMarker"://also click marker
                    let closestMarker = this.editor.closestMarker(x, y);
                    //if mouse up position == mouse down position => marker is clicked
                    if (closestMarker.distance < this.editor.detectMouseOnMarkerDistance && this.editor.state.mouseDownInfo!.x == xPrecise && this.editor.state.mouseDownInfo!.y == yPrecise) {
                        //dont focus main pattern on mask frame
                        this.editor.focusedPattern().markerClicked(closestMarker.marker);
                        this.editor.clearViewportUI();
                        this.editor.startEdit(this.editor.focusedPattern());
                    }
                    this.editor.state.setAction("edit");
                    this.editor.currProj().frame().updateInfoBox(pattern);
                    this.editor.saveToHistory();
                    this.editor.currProj().frame().setOpacity(1);
                    this.editor.currProj().repaint(pattern);
                    break;
                case "dragPattern":
                    this.editor.state.setAction("edit");
                    this.editor.currProj().frame().updateInfoBox(pattern);
                    this.editor.saveToHistory();
                    this.editor.currProj().frame().setOpacity(1);
                    //only repaint if moved -> repaint stops doubleclick from working
                    if (this.editor.state.draggingInfo) {
                        if (this.editor.relX(event.clientX, 0, undefined, 1) != this.editor.state.draggingInfo.x || this.editor.relY(event.clientY, 0, undefined, 1) != this.editor.state.draggingInfo.y) {
                            this.editor.currProj().repaint(pattern);
                        }
                    }

                    break;
                default:
                    break;
            }
        }
    }

    handleDoubleClick(event: MouseEvent) {
        let clickedElement = this.editor.clickedElement(event);
        if (!clickedElement) return;

        switch (this.editor.state.currentAction) {
            case "edit":
            case "none":
                //stop edit on active element
                this.editor.stopEdit();
                //if pattern is clicked -> start editing
                if (clickedElement.parentElement.getAttribute("role") === "main") {
                    //dont focus main pattern on mask frame
                    if (this.editor.currProj().frame().boundId != clickedElement.parentElement.id) {
                        this.editor.state.setAction("edit");
                        this.editor.focus(this.editor.patternById(clickedElement.parentElement.id));
                        this.editor.focusedPattern().doubleclicked();
                        this.editor.repaint(this.editor.focusedPattern());
                        this.editor.addHelperOutline(this.editor.focusedPattern());
                    }
                }
                break;
        }
    }

    // Helpers
    private setDraggingInfo(editedObject: any, event: MouseEvent) {
        this.editor.state.editedObject = editedObject;
        let draggingInfo = {
            x: this.editor.relX(event.clientX, 0, undefined, 1),
            y: this.editor.relY(event.clientY, 0, undefined, 1),
            relToPatternOriginX: this.editor.relX(event.clientX, 0, undefined, 1) - this.editor.state.editedObject.xOrigin,
            relToPatternOriginY: this.editor.relY(event.clientY, 0, undefined, 1) - this.editor.state.editedObject.yOrigin
        };
        this.editor.state.setDraggingInfo(draggingInfo);
    }

    private setMouseInfo(event: MouseEvent) {
        this.editor.state.mouseDownInfo = {
            x: this.editor.relX(event.clientX, 0, undefined, 1),
            y: this.editor.relY(event.clientY, 0, undefined, 1)
        }
    }

    private adjustPatternToOther(pattern: any, editedObject: any, event: MouseEvent) {
        switch (this.editor.state.currentAction) {
            case "dragMarker":
                //change marker position
                editedObject.x = this.editor.relX(event.clientX);
                editedObject.y = this.editor.relY(event.clientY);
                this.editor.clearViewportUI();
                //get changes that should be done to the pattern accordingly
                let changes = pattern.markerEdited(editedObject, this.editor.state.gridsize, this.editor.relX(event.clientX, 0, undefined, 1), this.editor.relY(event.clientY, 0, undefined, 1));
                this.editor.currProj().alterPattern(pattern, changes);
                this.editor.addEditUI(pattern);
                //repaint point and marker and outline
                if (changes.rotation != undefined) {
                    this.editor.addHelperRotation(pattern);
                }
                this.editor.currProj().frame().updateInfoBox(pattern);
                break;
            case "dragPattern":
                if (!this.editor.state.draggingInfo) return;
                let newOriginX = this.editor.relX(event.clientX, (this.editor.state.draggingInfo.relToPatternOriginX));
                let newOriginY = this.editor.relY(event.clientY, (this.editor.state.draggingInfo.relToPatternOriginY));
                if (newOriginX !== pattern.xOrigin || newOriginY !== pattern.yOrigin) {
                    this.editor.clearViewportUI();
                    pattern.translateTo(newOriginX, newOriginY);
                    //repaint point and marker
                    this.editor.addEditUI(pattern);
                    this.editor.currProj().frame().updateInfoBox(pattern);
                }
                break;
            default:
                //edit, but no further action
                break;
        }
    }
}
