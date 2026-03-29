import IconCreatorGlobal from "../IconCreatorGlobal";
import { EditorState } from "../model/EditorState";

export default class ToolTutorial {
    private element: HTMLElement;
    private titleElement: HTMLElement;
    private contentElement: HTMLElement;
    private dontShowAgainCheckbox: HTMLInputElement;
    private videoElement: HTMLVideoElement;
    private state: EditorState;
    private currentToolName: string = "";

    private tutorialData: { [key: string]: { title: string, content: string, videoUrl?: string } } = {
        "Rect": {
            title: "Rectangle Tool",
            content: "Click and drag on the canvas to draw a rectangle.",
            videoUrl: "video/tut_rectangle_tool.mp4"
        },
        "Circle": {
            title: "Circle Tool",
            content: "Click and drag to draw a circle.",
            videoUrl: "video/tut_circle_tool.mp4"
        },
        "Ellipse": {
            title: "Ellipse Tool",
            content: "Click and drag to draw an ellipse.",
            videoUrl: "video/tut_ellipse_tool.mp4"
        },
        "Line": {
            title: "Line Tool",
            content: "Click and drag to draw a straight line.",
            videoUrl: "video/tut_line_tool.mp4"
        },
        "Path": {
            title: "Custom Shape Tool",
            content: "Press and hold the mouse button to start drawing. Click to add points. Click the start point to close the shape.",
            videoUrl: "video/tut_path_tool.mp4"
        },
        "Text": {
            title: "Text Tool",
            content: "Click on the canvas to place text. Double click to edit it.",
            videoUrl: "video/tut_text_tool.mp4"
        },
        "paintBucket": {
            title: "Paint Tool",
            content: "Click on a pattern to fill it with the selected color. Click the tool icon again to change the color.",
            videoUrl: "video/tut_paintBucket_tool.mp4"
        }
    };

    constructor(container: HTMLElement, state: EditorState) {
        this.state = state;

        this.element = IconCreatorGlobal.el("div", "", "tool-tutorial");
        this.element.classList.add("hidden");

        const header = IconCreatorGlobal.el("div", "", "tutorial-header");
        this.titleElement = IconCreatorGlobal.el("div", "Tutorial", "tutorial-title");
        const closeBtn = IconCreatorGlobal.el("div", "×", "tutorial-close");
        closeBtn.addEventListener("click", () => this.hide());
        header.append(this.titleElement, closeBtn);

        this.contentElement = IconCreatorGlobal.el("div", "", "tutorial-content");

        const videoContainer = document.createElement("div");
        videoContainer.className = "tutorial-video-container";

        this.videoElement = document.createElement("video");
        this.videoElement.className = "tutorial-video";
        this.videoElement.autoplay = true;
        this.videoElement.loop = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        videoContainer.append(this.videoElement);

        const footer = IconCreatorGlobal.el("div", "", "tutorial-footer");
        this.dontShowAgainCheckbox = document.createElement("input");
        this.dontShowAgainCheckbox.type = "checkbox";
        this.dontShowAgainCheckbox.id = "dont-show-tutorial";
        const label = document.createElement("label");
        label.htmlFor = "dont-show-tutorial";
        label.innerText = "Don't show for this tool again";
        footer.append(this.dontShowAgainCheckbox, label);

        this.dontShowAgainCheckbox.addEventListener("change", () => {
            if (this.dontShowAgainCheckbox.checked) {
                this.state.hideTutorial(this.currentToolName);
            } else {
                this.state.unhideTutorial(this.currentToolName);
            }
        });

        this.element.append(header, videoContainer, this.contentElement, footer);
        container.append(this.element);
    }

    show(type: string, toolButtonElement?: HTMLElement): void {
        const data = this.tutorialData[type];

        if (!data || this.state.isTutorialHidden(type)) {
            this.hide();
            return;
        }

        this.currentToolName = type;
        this.titleElement.innerText = data.title;
        this.contentElement.innerText = data.content;

        // Sync checkbox state for this tool
        this.dontShowAgainCheckbox.checked = this.state.isTutorialHidden(type);

        // Position vertically to align with the tool button
        if (toolButtonElement) {
            const btnRect = toolButtonElement.getBoundingClientRect();
            this.element.style.top = btnRect.top + "px";
        }

        // Handle video
        if (data.videoUrl) {
            this.videoElement.src = data.videoUrl;
            this.videoElement.style.display = "block";
            this.videoElement.play().catch(e => console.warn("Video playback failed", e));
        } else {
            this.videoElement.style.display = "none";
            this.videoElement.pause();
        }

        this.element.classList.remove("hidden");
    }

    hide(): void {
        this.videoElement.pause();
        this.element.classList.add("hidden");
    }
}
