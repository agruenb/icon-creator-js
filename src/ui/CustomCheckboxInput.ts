import IconCreatorGlobal from "../IconCreatorGlobal";

/**
 * Creates a custom-styled checkbox input wrapped in a label.
 * NOTE: This class returns an HTMLElement (HTMLLabelElement) directly from its constructor.
 */
export default class CustomCheckboxInput extends IconCreatorGlobal {

    /**
     * @param className - CSS class for the label container
     * @param value - Initial checked state
     * @param content - Inner HTML/string for the label text
     * @returns A styled HTMLLabelElement containing the checkbox
     */
    constructor(className: string = "", value: boolean, content: string = "") {
        super();
        let display = document.createElement("label");
        display.classList.add(className, "custom-component");
        display.setAttribute("for", this.id);
        display.style.cssText = "position:relative;";
        display.innerHTML = "<div>" + content + "</div>";

        // input
        let input = document.createElement("input");
        input.style.cssText = "height:0px;width:0px;position:absolute;visibility:hidden;";
        input.type = "checkbox";
        input.checked = value;
        input.id = this.id;

        input.addEventListener("change", (event: any) => {
            if (event.target.checked) {
                display.setAttribute("checked", "true");
            } else {
                display.removeAttribute("checked");
            }
        });

        if (value) {
            display.setAttribute("checked", "true");
        } else {
            display.removeAttribute("checked");
        }

        display.append(input);
        return display as any;
    }
}
