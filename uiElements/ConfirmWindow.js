class ConfirmWindow{

    container;

    constructor(container, headline="Please confirm", message, onAccept, onReject, acceptText = "Okay", rejectText="Cancel"){
        this.container = container;
        this.headline = headline;
        this.message = message;
        this.onAccept = onAccept;
        this.onReject = onReject;
        this.acceptText = acceptText;
        this.rejectText = rejectText;
        this.build();
    }
    build(){
        this.innerWrapper = document.createElement("div");
        this.innerWrapper.classList.add("confirm-wrapper", "wind-in", "box-shadow")
        let contentString = `
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
        this.acceptButton = this.innerWrapper.querySelector(".accept");
        this.acceptButton.addEventListener("click",()=>{this.close();this.onAccept();});
        this.rejectButton = this.innerWrapper.querySelector(".reject");
        this.rejectButton.addEventListener("click", ()=>{this.close();this.onReject()});
    }
    close(){
        this.innerWrapper.classList.remove("wind-in");
        this.innerWrapper.classList.add("wind-out");
        this.container.classList.remove("overlay-fade-in");
        setTimeout(()=>{
            this.container.style.cssText = "display:none;";
            this.container.innerHTML = "";
        },500);
    }
}