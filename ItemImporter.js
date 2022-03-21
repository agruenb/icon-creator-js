class ItemImporter{

    container;
    topParent;

    initialized = false;

    constructor(editor, environment){
        this.editor = editor;
        this.environment = environment;
        this.container = this.environment.layout.container;
        this.topParent = document.createElement("div");
        this.container.append(this.topParent);

        this.topParent.classList.add("top-parent");
        environment.openSavesButton.addEventListener("click",()=>{
            this.openTab("saves");
            this.toggleVisibility();
        });
        environment.openIconsButton.addEventListener("click",()=>{
            this.openTab("icons");
            this.toggleVisibility();
        });
    }
    init(){
        this.topParent.innerHTML = this.body();

        this.closeButton = this.topParent.querySelector(".close-button");
        this.closeButton.addEventListener("click",()=>{
            this.toggleVisibility();
        });
        this.savesTab = this.topParent.querySelector(".saves");
        this.savesTab.addEventListener("click",()=>{
            this.openTab("saves");
        })
        this.iconsTab = this.topParent.querySelector(".icons");
        this.iconsTab.addEventListener("click", () => {
            this.openTab("icons");
        });
        this.savesContent = this.topParent.querySelector(".saved-projects");
        this.iconsContent = this.topParent.querySelector(".preset-icons");

        this.selectFullIcons = this.topParent.querySelector(".full-icons");
        this.selectFullIcons.addEventListener("click", ()=>{
            this.changeIconType("full");
        });
        this.selectLineIcons = this.topParent.querySelector(".line-icons");
        this.selectLineIcons.addEventListener("click", ()=>{
            this.changeIconType("line");
        });

        this.appendSaves([full_red, global_icon_0, makukuma, full_red, desktop_outline, desktop_book, phone_global, global_icon_0, makukuma, desktop_outline, desktop_book, phone_global, global_icon_0, makukuma, desktop_outline, desktop_book, phone_global]);
        DataService.getIcons(0,"line").then(
            (data)=>{
                this.appendIcons(data);
            }
        );

        this.initialized = true;
    }
    openTab(tabName){
        if(!this.initialized){
            this.init();
        }
        switch(tabName){
            case "saves":
                this.iconsContent.classList.add("hidden");
                this.iconsTab.removeAttribute("selected","true");
                this.savesContent.classList.remove("hidden");
                this.savesTab.setAttribute("selected","true");
                break;
            case "icons":
                this.iconsContent.classList.remove("hidden");
                this.iconsTab.setAttribute("selected","true");
                this.savesContent.classList.add("hidden");
                this.savesTab.removeAttribute("selected","true");
                break;
            default:
                console.warn("Unkown tab name "+tabName);
                break;
        }
    }
    toggleVisibility(){
        this.container.classList.toggle("outside");
        this.container.classList.toggle("inside");
    }
    body(){
        return (`
            <div class="header">
                <div class="close-button"><img src="img/close_cross.svg"></div>
                <div class="tab saves header-item">
                    Saved
                </div>
                <div class="tab icons header-item">
                    Icons
                </div>
            </div>
            <div class="content vert-scroll">
                <div class="saved-projects">
                    <div class="save-current-wrapper">
                        <button selected>Save project</button>
                    </div>
                </div>
                <div class="preset-icons">
                    <div class="type-selection">
                        <button class="full-icons" selected>${button_icon_full}Full</button>
                        <button class="line-icons">${button_icon_outlined}Lines</button>
                    </div>
                </div>
            </div>
        `);
    }
    savesElement(svgHTML){
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
    iconElement(svgHTML){
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
    appendIcons(iterableExportedJSON){
        for(let i in iterableExportedJSON){
            let item = iterableExportedJSON[i];
            let itemElement = this.iconElement(item.preview);
            let insertButton = itemElement.querySelector(".insert-item");
            insertButton.addEventListener("click",()=>{
                this.insertItem(item);
            });
            this.iconsContent.append(itemElement);
        }
    }
    appendSaves(iterableExportedJSON){
        for(let i in iterableExportedJSON){
            let item = iterableExportedJSON[i];
            let itemElement = this.savesElement(item.preview);
            let insertButton = itemElement.querySelector(".insert-item");
            insertButton.addEventListener("click",()=>{
                this.insertItem(item);
            });
            let openButton = itemElement.querySelector(".open-item");
            openButton.addEventListener("click",()=>{
                this.openItem(item);
            });
            this.savesContent.append(itemElement);
        }
    }
    insertItem(item){
        if(item.type === "containsFrame"){
            this.editor.currProj().frame().load(item.editorData, false);
            this.editor.repaint();
            this.editor.saveToHistory();
        }else{
            console.error("Importer cannot import "+item.type+" on Frame");
        }
    }
    openItem(item){
        if(this.editor.currProj().keyframes[0].patterns.length != 0){
            let onAccept = ()=>{
                this.editor.currProj().keyframes[0].reset();
                this.editor.currProj().keyframes[0].load(item.editorData);
                this.editor.saveToHistory();
                this.editor.repaint();
            }
            let onReject = ()=>{
                return;
            }
            let message = "The currently opened project will be saved, but can only be re-accessed with a paid plan. Open the new Project anyway?";
            new ConfirmWindow(this.environment.layout.overlay, "Replace Project",message,onAccept, onReject);
        }
    }
    changeIconType(type){
        switch(type){
            case "line":
                this.selectLineIcons.setAttribute("selected","true");
                this.selectFullIcons.removeAttribute("selected");
                break;
            case "full":
                this.selectFullIcons.setAttribute("selected","true");
                this.selectLineIcons.removeAttribute("selected");
                break;
            default:
                console.warn("Unkown icons type name "+tabName);
                break;
        }
    }
}