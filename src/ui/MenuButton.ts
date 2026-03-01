/**
 * A reusable menu button with an icon and label.
 */
export default class MenuButton {
    element: HTMLDivElement;

    /**
     * @param label - The text label for the button
     * @param icon - Path to the icon image
     * @param transformation - Optional CSS transform string for the icon
     * @param clickHandler - Callback for click events
     */
    constructor(label: string, icon: string, transformation: string = "", clickHandler: () => void) {
        this.element = document.createElement("div");

        let iconElement = document.createElement("div");
        iconElement.classList.add("icon");
        iconElement.style.transform = transformation;

        let imgElement = document.createElement("img");
        imgElement.src = icon;

        let labelElement = document.createElement("span");
        iconElement.append(imgElement);
        labelElement.innerHTML = label;

        this.element.append(iconElement);
        this.element.append(labelElement);
        this.element.classList.add("contextmenu-button", "clickable");

        this.element.addEventListener("mousedown", (mouseEvent: MouseEvent) => {
            mouseEvent.stopPropagation();
        });

        this.element.addEventListener("mousemove", (mouseEvent: MouseEvent) => {
            mouseEvent.stopPropagation();
        });

        this.element.addEventListener("mouseup", (mouseEvent: MouseEvent) => {
            mouseEvent.stopPropagation();
        });

        this.element.addEventListener("click", (mouseEvent: MouseEvent) => {
            clickHandler();
            mouseEvent.stopPropagation();
        });
    }

    /**
     * Appends the button to a parent element.
     * @param element - The parent element
     */
    addTo(element: HTMLElement): void {
        element.append(this.element);
    }
}
