import IconCreatorGlobal from "./IconCreatorGlobal";
import CustomColorInput from "./ui/CustomColorInput";
import Project from "./Project";

import UniversalOps from "./shared/UniversalOps";
import PointOperations from "./shared/PointOperations";

import Banner from "./ui/Banner";

import ExportWindow from "./ui/ExportWindow";
import ConfirmWindow from "./ui/ConfirmWindow";
import TouchInputAdapter from "./shared/TouchInputAdapter";
import { gAnalyticsTrackEvent } from "./lib/googleAnalytics";
import { EditorState } from "./model/EditorState";
import { InteractionManager } from "./control/InteractionManager";
import { HistoryManager } from "./control/HistoryManager";
import { PatternManager } from "./control/PatternManager";
import { UIManager } from "./control/UIManager";
import ImageProcessor from "./shared/imageProcessor"; // Added import

// Define Environment interface based on index.js structure
interface Environment {
    document: Document;
    window: Window;
    layout: {
        container: HTMLElement;
        viewport: HTMLElement;
        resultViewport: HTMLElement;
        elementOverview: HTMLElement;
        overlay: HTMLElement;
        elementOverviewContainer?: HTMLElement; // Possible missing property
    };
    control: {
        editSVG: {
            cursor: HTMLElement;
            clearAll: HTMLElement;
        };
        history: {
            back: HTMLElement;
            forwards: HTMLElement;
        };
        meta: {
            gridsize: { [key: string]: HTMLElement };
            bgColor: { [key: string]: HTMLElement };
            paintColor: HTMLElement;
            exclusiveView: HTMLInputElement;
            moreOptions: HTMLElement;
        };
        export: {
            file: HTMLElement;
            inline: any;
        };
    };
    config: {
        patterns: Array<{
            class: any;
            startPaintButton: HTMLElement;
        }>;
    };
}

export default class HTMLeditor {

    activeProjects: Project[] = new Array();
    environment: any;
    drawingViewport: HTMLElement;
    interactionManager: InteractionManager;
    uiManager: UIManager;
    historyManager: HistoryManager;
    patternManager: PatternManager;

    detectMouseOnMarkerDistance = 8;
    markerScaleOnMouseHover = 1.4;
    markerScaleOnMouseDown = 0.8;//unused
    rotationMarkerDistanceFromPattern = 20;//TODO remove after relocation

    minCoordinate = -2048;
    editOpacity = 0.8;

    keepHistory = true;
    exclusivView = false;

    colorSchemeLight = true;
    preventBrowsershortcuts = true;

    state = new EditorState();

    constructor(environment: Environment) {
        this.environment = environment;
        //setup viewport
        this.environment.layout.viewport.style.cssText = "position:relative;overflow:hidden";
        this.drawingViewport = this.environment.layout.resultViewport;
        this.drawingViewport.style.cssText = "height:512px;width:512px;";
        //init control
        this.environment.control.editSVG.cursor.addEventListener("click", () => {
            this.focus();
            this.setDrawingType("none");
        });
        this.environment.control.editSVG.clearAll.addEventListener("click", () => {
            let onAccept = () => this.clearProject();
            let onReject = () => { return; }
            let message = "Everything will be cleared. A recovery will not be possible.";
            new ConfirmWindow(this.environment.layout.overlay, "New Project", message, onAccept, onReject);
        });
        //pattern creation
        for (let i in this.environment.config.patterns) {
            let item = this.environment.config.patterns[i];
            if (item.startPaintButton) {
                //touch events are handled differently from mouse events, so they have to be propagated to the viewport
                //mousedown/touchstart
                item.startPaintButton.addEventListener("mousedown", () => {
                    this.setDrawingType("dragOut");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map((item: any) => { return item.startPaintButton }), this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
                item.startPaintButton.addEventListener("touchstart", (e: TouchEvent) => {
                    e.preventDefault();
                    this.setDrawingType("dragOut");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map((item: any) => { return item.startPaintButton }), this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
                item.startPaintButton.addEventListener("touchstart", (e: TouchEvent) => this.environment.layout.viewport.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e)));
                //touchmove
                item.startPaintButton.addEventListener("touchmove", (e: TouchEvent) => this.environment.layout.viewport.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e)));
                //mouseup/touchend
                item.startPaintButton.addEventListener("mouseup", () => {
                    this.setDrawingType("clickedPaintPattern");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map((item: any) => { return item.startPaintButton }), this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
                item.startPaintButton.addEventListener("touchstop", (e: Event) => {
                    e.preventDefault();
                    this.setDrawingType("clickedPaintPattern");
                    UniversalOps.selectRadio(item.startPaintButton, [...this.environment.config.patterns.map((item: any) => { return item.startPaintButton }), this.environment.control.editSVG.cursor]);
                    this.state.paintPatternClass = item.class;
                });
                item.startPaintButton.addEventListener("touchend", (e: TouchEvent) => this.environment.layout.viewport.dispatchEvent(TouchInputAdapter.duplicateTouchEvent(e)));
            }
        }
        //meta edits
        for (let key in this.environment.control.meta.gridsize) {
            this.environment.control.meta.gridsize[key].addEventListener("click", () => { this.changeGrid(this.environment.control.meta.gridsize[key].value) });
        }
        for (let key in this.environment.control.meta.bgColor) {
            this.environment.control.meta.bgColor[key].addEventListener("click", () => { this.changeBackground(this.environment.control.meta.bgColor[key].value) });
        }

        let colorInput = new CustomColorInput("pseudo-input", "#660033");
        this.environment.control.meta.paintColor.append(colorInput as unknown as Node);
        this.environment.control.meta.paintColor.addEventListener("click", () => { this.setDrawingType("none") });
        (colorInput as unknown as HTMLElement).addEventListener("change", (e: any) => { this.setPaintColor(e.target.value) });

        this.environment.control.meta.exclusiveView.addEventListener("change", (e: Event) => {
            this.setExclusiveView((e.target as HTMLInputElement).checked);
        });
        this.environment.control.export.file.addEventListener("click", () => { this.exportFile() });

        this.environment.control.history.back.addEventListener("click", () => { this.reverseLastAction() });
        this.environment.control.history.forwards.addEventListener("click", () => { this.reInitLastReverse() });
        this.environment.control.history.back.classList.add("disabled");
        this.environment.control.history.forwards.classList.add("disabled");

        this.environment.control.meta.moreOptions.addEventListener("click", () => {
            this.addReferenceImage();
        });
        //setup for keyboard shortcuts
        this.environment.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.blockKeys(event);
        });
        this.environment.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.keyup(event);
        });
        //init mouse & touch events
        this.interactionManager = new InteractionManager(this);
        this.uiManager = new UIManager(this);
        this.historyManager = new HistoryManager(this);
        this.patternManager = new PatternManager(this);

        this.environment.layout.viewport.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            this.uiManager.openContextMenu(event);
            return false;
        }, false);
        this.environment.layout.viewport.addEventListener("mousemove", (event: MouseEvent) => { this.interactionManager.handleMouseMove(event); });
        this.environment.layout.viewport.addEventListener("touchmove", (event: TouchEvent) => {
            this.interactionManager.handleMouseMove(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event) as unknown as MouseEvent);
            event.preventDefault();
        });
        this.environment.layout.viewport.addEventListener("mousedown", (event: MouseEvent) => { this.interactionManager.handleMouseDown(event); });
        this.environment.layout.viewport.addEventListener("touchstart", (event: TouchEvent) => {
            this.interactionManager.handleMouseDown(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event) as unknown as MouseEvent);
            event.preventDefault();
        });
        this.environment.layout.viewport.addEventListener("mouseup", (event: MouseEvent) => { this.interactionManager.handleMouseUp(event); });
        this.environment.layout.viewport.addEventListener("touchend", (event: TouchEvent) => {
            this.interactionManager.handleMouseUp(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event) as unknown as MouseEvent);
            event.preventDefault();
        });
        this.environment.layout.viewport.addEventListener("touchcancel", (event: TouchEvent) => {
            this.interactionManager.handleMouseUp(TouchInputAdapter.convertTouchInputIntoSimpleMouseEvent(event) as unknown as MouseEvent);
            event.preventDefault();
        });
        this.environment.layout.viewport.addEventListener("dblclick", (event: MouseEvent) => { this.interactionManager.handleDoubleClick(event); });
        //resize listeners
        this.environment.window.addEventListener("resize", () => {
            this.currProj().drawBg();
        }
        );
    }



    /**
     * Adjust UI to reflect edited pattern. UI elements get fetched from the pattern and added to the frame UI layer.
     * @param {*} pattern 
     */
    /**
     * Adjust UI to reflect edited pattern. UI elements get fetched from the pattern and added to the frame UI layer.
     * @param {*} pattern 
     */
    addEditUI(pattern: any = this.focusedPattern()) {
        this.uiManager.addEditUI(pattern);
    }



    /** Creates and initializes a new project, appending it to the active projects list. */
    newProject() {
        let newProject = new Project(this.environment.layout.elementOverview, this);
        newProject.init(this.environment.layout.viewport);
        this.drawingViewport.append(newProject.container);
        this.activeProjects.push(newProject);
        //TEMP: does not work with multiple projects
        this.saveToHistory();
    }
    /**
     * Toggles exclusive view mode, which hides all patterns except the focused one.
     * @param status - Whether exclusive view should be enabled
     */
    setExclusiveView(status: boolean) {
        if (status) {
            this.exclusivView = true;
            if (this.focusedPattern() != undefined) {
                this.startEdit(this.focusedPattern());
            }
            this.repaint();
        } else {
            this.exclusivView = false;
            //show all patterns
            for (let id in this.currProj().frame().patterns) {
                this.currProj().frame().patterns[id].display = true;
            }
            this.currProj().frame().updateInfoBox();
            this.repaint();
        }
    }
    closeContextMenu() {
        this.uiManager.closeContextMenu();
    }


    mirrorCurrentPatternVertical() {
        this.patternManager.mirrorCurrentPatternVertical();
    }
    mirrorCurrentPatternHorizontal() {
        this.patternManager.mirrorCurrentPatternHorizontal();
    }
    duplicateCurrentPattern() {
        this.patternManager.duplicateCurrentPattern();
    }
    removeCurrentPattern() {
        this.patternManager.removeCurrentPattern();
    }
    addPattern(type: string, x: number, y: number) {
        return this.patternManager.addPattern(type, x, y);
    }
    addHelperMarker(...params: any[]) {
        this.uiManager.addHelperMarker(...params);
    }
    addHelperOutline(pattern: any) {
        this.uiManager.addHelperOutline(pattern);
    }
    addHelperLine(x: number, y: number, endX: number, endY: number, dashArray: any) {
        this.uiManager.addHelperLine(x, y, endX, endY, dashArray);
    }
    addHelperRotation(pattern: any) {
        this.uiManager.addHelperRotation(pattern);
    }
    removePattern(pattern: any) {
        this.patternManager.removePattern(pattern);
    }
    reverseLastAction() {
        this.historyManager.reverseLastAction();
    }
    reInitLastReverse() {
        this.historyManager.reInitLastReverse();
    }
    updateHistoryButtons() {
        this.historyManager.updateHistoryButtons();
    }
    /**
     * Switches between editor views (e.g. 'arange' for main view, 'mask' for carve-out mode).
     * @param view - The view identifier to switch to
     */
    changeView(view: string = "arange") {
        if (this.state.view == view) {
            return;
        }
        let focusedPattern = this.focusedPattern();
        //need to know if certain views are possible in current state
        let editPossible = (this.state.currentAction == "edit") ? true : false;
        this.stopEdit();
        this.setDrawingType("none");
        switch (view) {
            case "arange":
                this.state.view = view;
                this.currProj().setFrame(this.currProj().keyframes[0]);
                this.saveToHistory();
                break;
            case "mask":
                if (editPossible) {
                    if (focusedPattern.allowMask) {
                        this.state.view = view;
                        this.currProj().switchToMask(focusedPattern);
                        //ui
                        let callback = () => { this.changeView("arange") };
                        let headline = IconCreatorGlobal.el("div", "<img src='img/sys_carve_out_icon.svg'>Carve out mode", "title");
                        let banner = new Banner(headline, "Quit", callback);
                        banner.addTo(this.environment.layout.container);
                    } else {
                        alert("Cannot mask this pattern");
                    }
                }
                break;
            default:
                break;
        }
        this.updateHistoryButtons();
        gAnalyticsTrackEvent("change_view", {
            type: view
        });
    }
    /**
     * Begins editing a pattern: sets focus, opens the tool banner, and enables exclusive view if active.
     * @param pattern - The pattern to start editing
     */
    startEdit(pattern: any) {
        if (this.focusedPattern()) {
            this.stopEdit();
        }
        this.setDrawingType("none");
        this.state.currentAction = "edit";
        this.focus(pattern);
        this.addEditUI(pattern);
        if (this.exclusivView && !pattern.isReference) {
            //hide all patterns that are not selected
            for (let id in this.currProj().frame().patterns) {
                if (id != this.focusedPattern().id) {
                    this.currProj().frame().patterns[id].display = false;
                }
            }
            this.currProj().frame().updateInfoBox();
        }
        //edit banner
        this.uiManager.openToolBanner(pattern);
        this.repaint();
    }
    /** Stops editing the current pattern, resetting visibility and UI state. */
    stopEdit() {
        if (this.exclusivView) {
            //show all patterns
            for (let id in this.currProj().frame().patterns) {
                this.currProj().frame().patterns[id].display = true;
            }
            this.currProj().frame().updateInfoBox();
        }
        this.uiManager.closeToolBanner();
        this.focus();
        this.currProj().frame().stopEdit();
        this.state.currentAction = "none";
        this.repaint();
    }
    patternById(id: string) {
        return this.currProj().patternById(id);
    }
    /** Returns the currently focused pattern, or undefined if none. */
    focusedPattern() {
        return this.currProj().frame().focusedPattern;
    }
    /**
     * Focuses on the passed pattern. That means that editing will be enabled for the passed pattern.
     * If pattern is undefined the focus on all patterns is removed.
     * @param {Pattern} pattern pattern that should be focused
     */
    focus(pattern?: any) {
        if (this.focusedPattern()) {
            this.focusedPattern().lostFocus();
        }
        this.currProj().frame().focus(pattern);
        if (pattern) {
            pattern.gotFocus();
        }
    }
    clearViewportUI(specificElement?: any) {
        this.uiManager.clearViewportUI(specificElement);
    }
    duplicate(pattern: any) {
        this.patternManager.duplicate(pattern);
    }
    /** Returns the currently active project. */
    currProj() {
        return this.activeProjects[this.state.currentProject];
    }
    markers() {
        return this.currProj().frame().markers;
    }
    uiLayer() {
        return this.currProj().frame().uiLayer;
    }
    changeBackground(value: string) {
        let targetColor: string = "#ffffff";
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
        (document.querySelector(':root') as HTMLElement).style.setProperty('--viewport-background', targetColor);
        this.currProj().drawBg();
    }
    relX(x: number, remove = 0, min = -2048, steps = this.state.gridsize, max = 2048): number {
        let a = Math.trunc(Math.min(Math.max(x - (this.drawingViewport.getBoundingClientRect().x + remove), min), max));
        let overhang = a % steps;
        if (overhang < steps / 2) {
            return a - overhang;
        } else {
            return a - overhang + steps;
        }
    }
    relY(y: number, remove = 0, min = -2048, steps = this.state.gridsize, max = 2048): number {
        const a = Math.trunc(Math.min(Math.max(y - (this.drawingViewport.getBoundingClientRect().y + remove), min), max));
        let overhang = a % steps;
        if (overhang < steps / 2) {
            return a - overhang;
        } else {
            return a - overhang + steps;
        }
    }
    clickedElement(event: MouseEvent) {
        let elementStack = document.elementsFromPoint(event.clientX, event.clientY);
        let index = 0;
        while (elementStack[index].tagName === "svg" || elementStack[index].tagName === "SVG") {
            index++;
        }
        return elementStack[index];
    }
    saveToHistory() {
        this.historyManager.saveToHistory();
    }
    loadProject(projectJSON: any = {}) {
        //TEMP
        this.currProj().load(projectJSON);
    }
    /**
     * Sets the drawing/interaction type which determines how mouse events are interpreted.
     * @param type - The drawing type string (e.g. 'none', 'dragOut', 'clickedPaintPattern')
     */
    setDrawingType(type: string) {
        this.closeContextMenu();
        if (["rect0", "circle0", "ellipse0", "line0", "path0"].indexOf(type) !== -1) {
            this.setCursor(this.drawingViewport, "crosshair");
        } else {
            this.setCursor(this.drawingViewport, "default");
        }
        if (this.state.currentAction == "edit") {
            this.stopEdit();
        }
        if (type == "none") {
            UniversalOps.selectRadio(this.environment.control.editSVG.cursor, [...this.environment.config.patterns.map((item: any) => { return item.startPaintButton })]);
        }
        this.state.setAction(type as any);
    }
    /**
     * Returns the closest marker in the viewport to x,y. 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    closestMarker(x: number, y: number) {
        let min = {
            distance: Infinity,
            marker: {},
        }
        for (let i = 0; i < this.markers().length; i++) {
            let distToPoint = PointOperations.distance(x, y, this.markers()[i].x, this.markers()[i].y);
            if (distToPoint <= min.distance) {
                min = {
                    distance: distToPoint,
                    marker: this.markers()[i]
                }
            }
        }
        return min;
    }

    /**
     * Returns the closest marker to a mouse pointer from a mouse event. 
     * @param {MouseEvent} mouseEvent
     * @returns 
     */
    closestMarkerToMouse(mouseEvent: MouseEvent) {
        return this.closestMarker(this.relX(mouseEvent.clientX, 0, undefined, 1), this.relY(mouseEvent.clientY, 0, undefined, 1))
    }
    mouseOnCanvas(event: MouseEvent) {
        let canvasBox = this.drawingViewport.getBoundingClientRect();
        return PointOperations.withinBounds(event.clientX, event.clientY, canvasBox.x, canvasBox.y, canvasBox.x + parseInt(this.currProj().dimensions.width), canvasBox.y + parseInt(this.currProj().dimensions.height));
    }
    changeGrid(size: number) {
        if (size < 4) {
            this.state.gridsize = 1;
        } else {
            this.state.gridsize = Math.pow(2, size);
        }
        this.currProj().bgGridsize = this.state.gridsize;
        this.currProj().drawBg();
    }
    setPaintColor(color: string = "#000000") {
        this.currProj().setColor(color);
    }
    setCursor(element: HTMLElement, style: string = "cursor") {
        element.style.cursor = style;
    }
    repaint(pattern?: any) {
        this.currProj().repaint(pattern);
        this.updateHistoryButtons();
    }
    /**
     * Getter for infoBoxManager of current frame
     * @returns infoBoxManager of current frame
     */
    infoBoxManager() {
        return this.currProj().frame().infoBoxManager;
    }
    toTop(pattern: any) {
        this.currProj().toTop(pattern);
        this.infoBoxManager().toTop(pattern);
    }
    toBottom(pattern: any) {
        this.currProj().toBottom(pattern);
        this.infoBoxManager().toBottom(pattern);
    }
    oneUp(pattern: any) {
        this.currProj().oneUp(pattern);
        this.infoBoxManager().oneUp(pattern);
    }
    oneDown(pattern: any) {
        this.currProj().oneDown(pattern);
        this.infoBoxManager().oneDown(pattern);
    }
    translateFocussedPattern(x: number = 0, y: number = 0) {
        let pattern = this.focusedPattern();
        if (pattern) {
            pattern.translateTo(pattern.xOrigin + x, pattern.yOrigin + y);
            //repaint point and marker
            this.currProj().frame().updateInfoBox(pattern);
            this.clearViewportUI(pattern);
            this.addEditUI(pattern);
            this.currProj().repaint(pattern);
        }
    }
    addReferenceImage() {
        let callback = (image: any) => {
            if (image) {
                this.currProj().addReferenceImage(image);
            } else {
                console.warn("No image given");
            }
        }
        ImageProcessor.requestImage(callback);
    }
    clearProject() {
        this.clearViewportUI();
        this.currProj().reset();
        this.repaint();
        gAnalyticsTrackEvent("clear_project");
    }
    exportFile() {
        this.stopEdit();
        this.preventBrowsershortcuts = false;
        let callback = () => {
            this.preventBrowsershortcuts = true;
        }
        let exportWindow = new ExportWindow(this.environment.layout.overlay, this.currProj(), undefined, callback);
    }
    blockKeys(event: KeyboardEvent) {
        if (this.preventBrowsershortcuts) {
            if ([68, 90].indexOf(event.keyCode) !== -1) {
                event.preventDefault();
            }
        }
    }
    /**
     * Is triggered on key up events. If the patterns keypress function returns a truthy value, the input is not passed to the hotkey function.
     * @param {Keyboard Event} event 
     */
    keyup(event: KeyboardEvent) {
        let blockHotkeys = false;
        if (this.focusedPattern()) {
            blockHotkeys = this.focusedPattern().keypress(event);
            if (this.focusedPattern().repaintOnKeyUp) {
                this.repaint(this.focusedPattern());
            }
        }
        if (!blockHotkeys) {
            this.hotkey(event);
        }
    }
    hotkey(event: KeyboardEvent) {
        this.closeContextMenu();
        if (event.keyCode == 8) {
            event.preventDefault();
            this.removeCurrentPattern();
        } else if (event.keyCode == 39) {//arror right
            this.translateFocussedPattern(this.state.gridsize);
            this.saveToHistory();
        } else if (event.keyCode == 37) {//arror left
            this.translateFocussedPattern(-this.state.gridsize);
            this.saveToHistory();
        } else if (event.keyCode == 38) {//arrow up
            this.translateFocussedPattern(0, -this.state.gridsize);
            this.saveToHistory();
        } else if (event.keyCode == 40) {//arrow down
            this.translateFocussedPattern(0, this.state.gridsize);
            this.saveToHistory();
        }
        if (event.ctrlKey) {//conrolKey pressed -> action
            if (event.keyCode === 68) {//d
                event.preventDefault();
                this.duplicateCurrentPattern();
            } else
                if (event.keyCode === 90) {//z
                    event.preventDefault();
                    if (event.shiftKey) {
                        //ctrl+shift+z
                        this.reInitLastReverse();
                    } else {
                        this.reverseLastAction();
                    }
                }
        }
    }
}