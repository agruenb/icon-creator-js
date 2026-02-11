import IconCreatorGlobal from "../IconCreatorGlobal";
import MenuButton from "../uiElements/MenuButton";
import Banner from "../components/Banner";
import ContextMenu from "../uiElements/ContextMenu";
import Outline from "../helperPatterns/Outline";
import Marker from "../helperPatterns/Marker";
import UILine from "../helperPatterns/UILine";
import RotateDisplay from "../uiElements/RotateDisplay";

export class UIManager {
    editor: any;
    toolBanner: any;
    rotateDisplay: any;
    contextMenu: any;

    constructor(editor: any) {
        this.editor = editor;
    }

    addEditUI(pattern: any = this.editor.focusedPattern()) {
        if (["edit", "dragPattern", "dragMarker"].indexOf(this.editor.state.currentAction) != -1) {
            //adjust info boxes state
            let infoBox = this.editor.infoBoxManager().boxById(pattern.id);
            if (infoBox != undefined) {
                infoBox.highlight();
            }
            //fetch UI elements from pattern
            let markers = pattern.getMarkers();
            let lines = pattern.getLines();
            //add all UI elements to the frame ui layer
            for (let i in lines) {
                let lineParams = lines[i] as any[];
                this.addHelperLine(lineParams[0], lineParams[1], lineParams[2], lineParams[3], lineParams[4]);
            }
            this.addHelperOutline(pattern);
            for (let i in markers) {
                let markerParams = markers[i] as any[];
                this.addHelperMarker(...markerParams);
            }
        } else {
            console.warn(`Cannot prepare pattern for edit in ${this.editor.state.currentAction} mode`);
        }
    }

    clearViewportUI(specificElement: string | undefined = undefined) {
        if (specificElement == "rotationDisplay") {
            if (this.rotateDisplay != undefined) {
                this.rotateDisplay.element.remove();
            }
        } else {
            this.editor.currProj().frame().clearUI();
        }
    }

    addHelperMarker(...params: any[]) {
        let marker = new Marker(this.editor.drawingViewport, ...params);
        this.editor.uiLayer().append(marker.container);
        this.editor.markers().push(marker);
    }

    addHelperOutline(pattern: any) {
        let outline = new Outline(this.editor.drawingViewport, pattern);
        this.editor.uiLayer().append(outline.container);
    }

    addHelperLine(x: number, y: number, endX: number, endY: number, dashArray: any) {
        let uiline = new UILine(this.editor.drawingViewport, x, y, endX, endY, dashArray);
        this.editor.uiLayer().append(uiline.container);
    }

    addHelperRotation(pattern: any) {
        let rot = new RotateDisplay(this.editor.drawingViewport, pattern.center[0], pattern.center[1], pattern.rotation);
        this.rotateDisplay = rot;
        rot.addTo(this.editor.uiLayer());
    }

    closeContextMenu() {
        if (this.contextMenu != undefined) {
            this.contextMenu.close();
            delete this.contextMenu;
        }
    }

    openContextMenu(event: MouseEvent) {
        this.closeContextMenu();
        let options: any[] = [];
        let clickedElement = this.editor.clickedElement(event);
        if (!clickedElement) return;

        //if clicked on pattern
        if (clickedElement.parentElement.getAttribute("role") === "main") {
            //dont focus main pattern on mask frame
            if (this.editor.currProj().frame().boundId != clickedElement.parentElement.id) {
                this.editor.stopEdit();
                this.editor.startEdit(this.editor.patternById(clickedElement.parentElement.id));
                options.push(...this.defaultOptions(this.editor.focusedPattern()));
            }
        }
        //if a pattern is focussed
        if (this.editor.focusedPattern() != undefined) {
            let additionalOptions = this.editor.focusedPattern().additionalOptions(
                this.editor.relX(event.clientX, 0, undefined, 1),
                this.editor.relY(event.clientY, 0, undefined, 1),
                () => {
                    this.closeContextMenu();
                    this.editor.currProj().frame().repaint();
                    this.clearViewportUI();
                    this.editor.saveToHistory();
                    this.editor.startEdit(this.editor.focusedPattern());
                }
            );
            options = [
                ...additionalOptions,
                ...options
            ];
        }
        //no options possible
        if (options.length == 0) {
            console.warn("No context menu in this area");
            return;
        }
        this.contextMenu = new ContextMenu(event.clientX, event.clientY, this.editor.environment.layout.viewport);
        this.contextMenu.deploy(options);
    }

    defaultOptions(pattern: any) {
        if (pattern.isReference) {
            return [{
                label: "delete",
                clickHandler: () => { this.editor.removeCurrentPattern(); this.closeContextMenu(); },
                icon: "img/sys_trash_icon.svg",
                type: "general"
            }];
        }
        let options = [];
        if (!pattern.isMask && pattern.allowMask) {
            options.push({
                label: "carve out",
                clickHandler: () => { this.editor.changeView("mask"); this.closeContextMenu(); },
                icon: "img/sys_carve_out_icon.svg",
                type: "general"
            });
        }
        options.push({
            label: "duplicate",
            clickHandler: () => { this.editor.duplicateCurrentPattern(); this.closeContextMenu(); },
            icon: "img/sys_duplicate_icon.svg",
            type: "general"
        }, {
            label: "flip",
            clickHandler: () => { this.editor.mirrorCurrentPatternVertical(); this.closeContextMenu(); },
            icon: "img/sys_flip_icon.svg",
            type: "general"
        }, {
            label: "flip",
            clickHandler: () => { this.editor.mirrorCurrentPatternHorizontal(); this.closeContextMenu(); },
            icon: "img/sys_flip_icon.svg",
            type: "general",
            transform: "rotate(90deg)"
        }, {
            label: "delete",
            clickHandler: () => { this.editor.removeCurrentPattern(); this.closeContextMenu(); },
            icon: "img/sys_trash_icon.svg",
            type: "general"
        });
        return options;
    }

    closeToolBanner() {
        if (this.toolBanner) {
            this.toolBanner.close();
            delete this.toolBanner;
        }
    }

    openToolBanner(pattern: any) {
        if (this.toolBanner == undefined) {
            let buttonWrapper = IconCreatorGlobal.el("div", "", "tool-buttons");
            let options = this.defaultOptions(pattern);
            for (let i = 0; i < options.length; i++) {
                let button = new MenuButton(options[i].label, options[i].icon, options[i].transform, options[i].clickHandler);
                if (options[i].type == "general") {
                    button.addTo(buttonWrapper);
                }
            }
            let banner = new Banner(buttonWrapper);
            banner.addTo(this.editor.environment.layout.container);
            this.toolBanner = banner;
        }
    }
}
