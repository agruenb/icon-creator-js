/**
 * A modal window for user confirmation.
 */
export default class ConfirmWindow {
    container: HTMLElement;
    headline: string;
    message: string;
    onAccept: () => void;
    onReject: () => void;
    acceptText: string;
    rejectText: string;

    private innerWrapper!: HTMLDivElement;
    private acceptButton!: HTMLButtonElement;
    private rejectButton!: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        headline: string = "Please confirm",
        message: string,
        onAccept: () => void,
        onReject: () => void,
        acceptText: string = "Okay",
        rejectText: string = "Cancel"
    ) {
        this.container = container;
        this.headline = headline;
        this.message = message;
        this.onAccept = onAccept;
        this.onReject = onReject;
        this.acceptText = acceptText;
        this.rejectText = rejectText;
        this.build();
    }

    private build(): void {
        this.innerWrapper = document.createElement("div");
        this.innerWrapper.classList.add("confirm-wrapper", "wind-in", "box-shadow");

        const contentString = `
            <div class="header">
                <div class="text">${this.headline}</div>
                <img class="icon" src="img/add_plus.svg">
            </div>
            <div class="message-container">
                <div class="message">${this.message}</div>
            </div>
            <div class="button-row">
                <button class="reject">${this.rejectText}</button>
                <button class="accept" selected="true">${this.acceptText}</button>
            </div>
        `;
        this.innerWrapper.innerHTML = contentString;
        this.container.append(this.innerWrapper);
        this.container.style.cssText = "display:block;";
        this.container.classList.add("overlay-fade-in");

        this.acceptButton = this.innerWrapper.querySelector(".accept") as HTMLButtonElement;
        this.acceptButton.addEventListener("click", () => {
            this.close();
            this.onAccept();
        });

        this.rejectButton = this.innerWrapper.querySelector(".reject") as HTMLButtonElement;
        this.rejectButton.addEventListener("click", () => {
            this.close();
            this.onReject();
        });
    }

    close(): void {
        this.innerWrapper.classList.remove("wind-in");
        this.innerWrapper.classList.add("wind-out");
        this.container.classList.remove("overlay-fade-in");
        setTimeout(() => {
            this.container.style.cssText = "display:none;";
            this.container.innerHTML = "";
        }, 500);
    }
}
