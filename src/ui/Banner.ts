import IconCreatorGlobal from "../IconCreatorGlobal";

/**
 * A banner is a UI element that displays content at the top of a container,
 * with an optional close button.
 */
export default class Banner {
    element: HTMLDivElement;

    /**
     * @param content - The element to display inside the banner
     * @param closePhrase - Optional text for a close button (if empty, no button is shown)
     * @param actionOnClose - Callback executed when the banner is closed via the button
     */
    constructor(content: HTMLElement, closePhrase: string = "", actionOnClose: () => void = function () { }) {
        this.element = document.createElement("div");
        this.element.classList.add("banner", "box-shadow");

        let topWrapper = IconCreatorGlobal.el("div", "", "top-wrapper");
        topWrapper.append(content);
        this.element.append(topWrapper);

        if (closePhrase !== "") {
            let closeButton = IconCreatorGlobal.el("button", closePhrase, "close-button");
            closeButton.setAttribute("selected", "true");
            closeButton.addEventListener("click", () => {
                actionOnClose();
                this.close();
            });
            topWrapper.append(closeButton);
        }
    }

    /**
     * Appends the banner to the specified element.
     * @param element - The parent element
     */
    addTo(element: HTMLElement): void {
        element.append(this.element);
    }

    /**
     * Closes the banner with a slide-up animation and removes it from the DOM.
     */
    close(): void {
        this.element.style.animationName = "slideUp";
        setTimeout(() => {
            this.element.remove();
        }, 250);
    }
}
