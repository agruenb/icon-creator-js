import IconCreatorGlobal from "../IconCreatorGlobal";

export default class ToolTutorial {
    private element: HTMLElement;
    private titleElement: HTMLElement;
    private contentElement: HTMLElement;
    private dontShowAgainCheckbox: HTMLInputElement;
    private isHidden: boolean = false;

    private tutorialData: { [key: string]: { title: string, content: string } } = {
        "Rect": {
            title: "Rectangle Tool",
            content: "Click and drag on the canvas to draw a rectangle."
        },
        "Circle": {
            title: "Circle Tool",
            content: "Click and drag to draw a circle."
        },
        "Ellipse": {
            title: "Ellipse Tool",
            content: "Click and drag to draw an ellipse."
        },
        "Line": {
            title: "Line Tool",
            content: "Click and drag to draw a straight line."
        },
        "Path": {
            title: "Path Tool",
            content: "Click and drag your mouse to start drawing. Click to add points. Click the start point to close the shape."
        },
        "Text": {
            title: "Text Tool",
            content: "Click on the canvas to place text. Double click to edit it."
        },
        "none": {
            title: "Selection Tool",
            content: "Click on a pattern to select and edit it. Drag to move, or use the markers to scale and rotate."
        }
    };

    constructor(container: HTMLElement) {
        this.element = IconCreatorGlobal.el("div", "", "tool-tutorial");
        this.element.classList.add("hidden");

        const header = IconCreatorGlobal.el("div", "", "tutorial-header");
        this.titleElement = IconCreatorGlobal.el("div", "Tutorial", "tutorial-title");
        const closeBtn = IconCreatorGlobal.el("div", "×", "tutorial-close");
        closeBtn.addEventListener("click", () => this.hide());
        header.append(this.titleElement, closeBtn);

        this.contentElement = IconCreatorGlobal.el("div", "", "tutorial-content");

        const footer = IconCreatorGlobal.el("div", "", "tutorial-footer");
        this.dontShowAgainCheckbox = document.createElement("input");
        this.dontShowAgainCheckbox.type = "checkbox";
        this.dontShowAgainCheckbox.id = "dont-show-tutorial";
        const label = document.createElement("label");
        label.htmlFor = "dont-show-tutorial";
        label.innerText = "Don't show for these tools again";
        footer.append(this.dontShowAgainCheckbox, label);

        this.dontShowAgainCheckbox.addEventListener("change", () => {
            if (this.dontShowAgainCheckbox.checked) {
                localStorage.setItem("easyIcon_skipTutorials", "true");
            } else {
                localStorage.removeItem("easyIcon_skipTutorials");
            }
        });

        // Check initial state
        if (localStorage.getItem("easyIcon_skipTutorials") === "true") {
            this.isHidden = true;
            this.dontShowAgainCheckbox.checked = true;
        }

        this.element.append(header, this.contentElement, footer);
        container.append(this.element);
    }

    show(type: string): void {
        if (localStorage.getItem("easyIcon_skipTutorials") === "true") {
            return;
        }

        const data = this.tutorialData[type] || this.tutorialData["none"];
        this.titleElement.innerText = data.title;
        this.contentElement.innerText = data.content;

        this.element.classList.remove("hidden");
    }

    hide(): void {
        this.element.classList.add("hidden");
    }
}
