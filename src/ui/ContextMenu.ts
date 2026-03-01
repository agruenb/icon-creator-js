import MenuButton from "./MenuButton";

export interface ContextMenuOption {
    label: string;
    icon: string;
    transform?: string;
    clickHandler: () => void;
    type?: string;
}

/**
 * A context menu displayed at specific coordinates.
 */
export default class ContextMenu {
    container: HTMLDivElement = document.createElement("div");
    parentContainer: HTMLElement;

    /**
     * @param x - X coordinate relative to the parent container
     * @param y - Y coordinate relative to the parent container
     * @param parentContainer - The viewport or container to attach the menu to
     */
    constructor(x: number, y: number, parentContainer: HTMLElement) {
        this.container.style.cssText = `position:absolute;top:${y}px;left:${x}px;z-index:10001;`;
        this.container.classList.add("context-container", "box-shadow");
        this.parentContainer = parentContainer;
    }

    /**
     * Deploys the menu with the provided options, categorized into custom and general.
     * @param options - Array of menu options
     */
    deploy(options: ContextMenuOption[]): void {
        let customButtonWrapper = document.createElement("div");
        customButtonWrapper.classList.add("custom-options");
        let generalButtonWrapper = document.createElement("div");
        generalButtonWrapper.classList.add("general-options");

        for (let i = 0; i < options.length; i++) {
            let button = new MenuButton(options[i].label, options[i].icon, options[i].transform ?? "", options[i].clickHandler);
            if (options[i].type === "custom") {
                button.addTo(customButtonWrapper);
            } else {
                button.addTo(generalButtonWrapper);
            }
        }

        this.container.append(customButtonWrapper, generalButtonWrapper);
        this.parentContainer.append(this.container);
    }

    /**
     * Updates the menu position.
     * @param left - X coordinate
     * @param top - Y coordinate
     */
    setPosition(left: number, top: number): void {
        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
    }

    /**
     * Removes the context menu from the DOM.
     */
    close(): void {
        this.container.remove();
    }
}
