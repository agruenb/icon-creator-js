import IconCreatorGlobal from "../IconCreatorGlobal";

/**
 * Creates a custom-styled numerical input with increment/decrement buttons.
 * NOTE: This class returns an HTMLElement (HTMLLabelElement) directly from its constructor.
 */
export default class CustomNumberInput extends IconCreatorGlobal {
    /**
     * @param className - CSS class for the label container
     * @param pValue - Initial numerical value
     * @returns A styled HTMLLabelElement containing the number input and controls
     */
    constructor(className: string, pValue: number) {
        super();
        // display
        let display = document.createElement("label");
        display.classList.add(className, "custom-component", "number-input");
        display.setAttribute("for", this.id);
        display.style.cssText = "position:relative;display:flex;justify-content:center;align-items:center;background:#fff;";

        // value
        let value = document.createElement("div");
        value.innerHTML = String(pValue);

        // input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "number";
        input.setAttribute("min", "0");
        input.id = this.id;
        input.value = String(pValue);

        input.addEventListener("change", (event: any) => {
            value.innerHTML = event.target.value;
        });

        // hover buttons
        let up = document.createElement("div");
        up.classList.add("adjust-up", "adjust");
        up.addEventListener("click", (event: MouseEvent) => {
            input.value = String(parseInt(input.value) + 1);
            input.dispatchEvent(new Event('change'));
        });

        let down = document.createElement("div");
        down.classList.add("adjust-down", "adjust");
        down.addEventListener("click", (event: MouseEvent) => {
            input.value = String(parseInt(input.value) - 1);
            input.dispatchEvent(new Event('change'));
        });

        display.append(value);
        display.append(up, down);
        display.append(input);
        return display as any;
    }
}
