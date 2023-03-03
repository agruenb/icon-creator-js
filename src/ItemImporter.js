import DataService from "./shared/dataService";

export default class ItemImporter {

    container;
    topParent;

    lineIcons;
    fullIcons;

    initialized = false;

    constructor(editor, environment) {
        this.editor = editor;
        this.environment = environment;
        this.container = this.environment.layout.container;
        this.topParent = document.createElement("div");
        this.container.append(this.topParent);

        this.topParent.classList.add("top-parent");
        environment.openSavesButton.addEventListener("click", () => {
            this.openTab("saves");
            this.toggleVisibility();
        });
        environment.openIconsButton.addEventListener("click", () => {
            this.openTab("icons");
            this.toggleVisibility();
        });
    }
    init() {
        this.topParent.innerHTML = this.body();

        this.closeButton = this.topParent.querySelector(".close-button");
        this.closeButton.addEventListener("click", () => {
            this.toggleVisibility();
        });
        this.savesTab = this.topParent.querySelector(".saves");
        this.savesTab.addEventListener("click", () => {
            this.openTab("saves");
        })
        this.iconsTab = this.topParent.querySelector(".icons");
        this.iconsTab.addEventListener("click", () => {
            this.openTab("icons");
        });
        this.savesContent = this.topParent.querySelector(".saved-projects");
        this.iconsContent = this.topParent.querySelector(".preset-icons");

        this.selectFullIcons = this.topParent.querySelector(".full-icons");
        this.selectFullIcons.addEventListener("click", () => {
            this.changeIconType("full");
        });
        this.selectLineIcons = this.topParent.querySelector(".line-icons");
        this.selectLineIcons.addEventListener("click", () => {
            this.changeIconType("line");
        });
        this.fullIconsContent = this.topParent.querySelector(".preset-icons-content.full");

        this.lineIconsContent = this.topParent.querySelector(".preset-icons-content.line");

        //load selected icons page
        this.changeIconType("line");
        this.initialized = true;
    }
    openTab(tabName) {
        if (!this.initialized) {
            this.init();
        }
        switch (tabName) {
            case "saves":
                this.iconsContent.classList.add("hidden");
                this.iconsTab.removeAttribute("selected", "true");
                this.savesContent.classList.remove("hidden");
                this.savesTab.setAttribute("selected", "true");
                break;
            case "icons":
                this.iconsContent.classList.remove("hidden");
                this.iconsTab.setAttribute("selected", "true");
                this.savesContent.classList.add("hidden");
                this.savesTab.removeAttribute("selected", "true");
                break;
            default:
                console.warn("Unkown tab name " + tabName);
                break;
        }
    }
    toggleVisibility() {
        this.container.classList.toggle("outside");
        this.container.classList.toggle("inside");
    }
    body() {
        let heartFull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <defs>
                <style type="text/css">
                    .button-heart-filled {
                        fill:currentColor;
                    }
                </style>
            </defs>    
            <path d="M 246 468 Q 96 288 71 237 Q 64 224 62 220 A 107.33126291998991 107.33126291998991 0 0 1 254 124 Q 256 128 258 124 A 107.33126291998991 107.33126291998991 0 0 1 450 220 Q 448 224 441 237 Q 416 288 266 468 Q 256 480 246 468 Z" class="button-heart-filled"></path>
        </svg>`;
        let heartOutline = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <defs>
                <style type="text/css">
                    .heart-icon {
                        stroke:currentColor;
                    }
                </style>
            </defs>
            <path class="heart-icon" d="M 246 468 Q 96 288 71 237 Q 64 224 62 220 A 107.33126291998991 107.33126291998991 0 0 1 254 124 Q 256 128 258 124 A 107.33126291998991 107.33126291998991 0 0 1 450 220 Q 448 224 441 237 Q 416 288 266 468 Q 256 480 246 468 Z" fill="transparent" stroke-width="60"></path>
        </svg>`;
        return (`
            <div class="header">
                <div class="close-button"><img src="img/close_cross.svg"></div>
                <div class="tab saves header-item">
                    <img src="img/save_icon.svg" alt="burger menu"> Saved
                </div>
                <div class="tab icons header-item">
                <img src="img/icons_icon.svg" alt="burger menu"> Icons
                </div>
            </div>
            <div class="content vert-scroll">
                <div class="saved-projects">
                    <div class="save-current-wrapper">
                        <button selected>Save project</button>
                    </div>
                    <div class="roadmap-link-wrapper">
                        <div>Feature may come soon. Visit <a href="https://www.easyicononline.com/roadmap" target="_blank">www.easyicononline.com/roadmap</a> for more information.</div>
                    </div>
                </div>
                <div class="preset-icons">
                    <div class="type-selection">
                        <button class="full-icons" selected>${heartFull}Full</button>
                        <button class="line-icons">${heartOutline}Lines</button>
                    </div>
                    <div class="preset-icons-content full">
                    </div>
                    <div class="preset-icons-content line">
                    </div>
                </div>
            </div>
        `);
    }
    savesElement(svgHTML) {
        let el = document.createElement("div");
        el.classList.add("item");
        el.innerHTML = `
            <div class="preview">
                ${svgHTML}
            </div>
            <div class="actions">
                <button class="compact insert-item">Insert</button>
                <button class="compact open-item" selected="true">Open</button>
            </div>`;
        return el;
    }
    iconElement(svgHTML) {
        let el = document.createElement("div");
        el.classList.add("item");
        el.innerHTML = `
            <div class="preview">
                ${svgHTML}
            </div>
            <div class="actions">
                <button class="compact insert-item">Insert</button>
            </div>`;
        return el;
    }
    appendIcons(element, iterableExportedJSON) {
        for (let i in iterableExportedJSON) {
            let item = iterableExportedJSON[i];
            let itemElement = this.iconElement(item.preview);
            let insertButton = itemElement.querySelector(".insert-item");
            insertButton.addEventListener("click", () => {
                this.insertItem(item);
            });
            element.append(itemElement);
        }
    }
    appendSaves(iterableExportedJSON) {
        for (let i in iterableExportedJSON) {
            let item = iterableExportedJSON[i];
            let itemElement = this.savesElement(item.preview);
            let insertButton = itemElement.querySelector(".insert-item");
            insertButton.addEventListener("click", () => {
                this.insertItem(item);
            });
            let openButton = itemElement.querySelector(".open-item");
            openButton.addEventListener("click", () => {
                this.openItem(item);
            });
            this.savesContent.append(itemElement);
        }
    }
    insertItem(item) {
        if (item.type === "containsFrame") {
            this.editor.currProj().frame().load(item.editorData, false);
            this.editor.repaint();
            this.editor.saveToHistory();
        } else {
            console.error("Importer cannot import " + item.type + " on Frame");
        }
    }
    openItem(item) {
        if (this.editor.currProj().keyframes[0].patterns.length != 0) {
            let onAccept = () => {
                this.editor.currProj().keyframes[0].reset();
                this.editor.currProj().keyframes[0].load(item.editorData);
                this.editor.saveToHistory();
                this.editor.repaint();
            }
            let onReject = () => {
                return;
            }
            let message = "The currently opened project will be saved, but can only be re-accessed with a paid plan. Open the new Project anyway?";
            new ConfirmWindow(this.environment.layout.overlay, "Replace Project", message, onAccept, onReject);
        }
    }
    changeIconType(type) {
        switch (type) {
            case "line":
                if (!this.lineIcons) {
                    DataService.getIcons(0, "line").then(
                        (data) => {
                            this.lineIcons = data;
                            this.appendIcons(this.lineIconsContent, this.lineIcons);
                        }
                    );
                }
                this.selectLineIcons.setAttribute("selected", "true");
                this.selectFullIcons.removeAttribute("selected");
                this.fullIconsContent.style.display = "none";
                this.lineIconsContent.style.display = "grid";
                break;
            case "full":
                if (!this.fullIcons) {
                    DataService.getIcons(0, "full").then(
                        (data) => {
                            this.fullIcons = data;
                            this.appendIcons(this.fullIconsContent, this.fullIcons);
                        }
                    );
                }
                this.selectFullIcons.setAttribute("selected", "true");
                this.selectLineIcons.removeAttribute("selected");
                this.fullIconsContent.style.display = "grid";
                this.lineIconsContent.style.display = "none";
                break;
            default:
                console.warn("Unkown icons type name " + tabName);
                break;
        }
    }
}