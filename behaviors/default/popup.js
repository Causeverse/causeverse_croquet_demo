class PopUpWindowPawn {
    setup() {
        if (this.popUpWindow) {
            this.removePopup();
        }

        this.subscribe("popupWindow", "popup", "popup");
        this.subscribe("popupWindow", "popdown", "popdown");
        this.subscribe("popupWindow", "addImage", "addImage");
    }

    popup() {
        if (!this.popupWindow) {
            this.addPopup();
        }
    }

    popdown() {
        this.removePopup();
    }

    removePopup() {
        if (this.popupWindow) {
            this.popupWindow.remove();
            delete this.popupWindow;
        }
        if (this.windowMessageHandler) {
            window.removeEventListener("message", this.windowMessageHandler);
            delete this.windowMessageHandler;
        }
    }

    addPopup() {
        if (this.popupWindow) {
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            this.popupWindow = document.createElement("iframe");
            this.popupWindow.src = "./cart.html";

            this.popupWindow.width = 300;
            this.popupWindow.height = 300;
            this.popupWindow.style.position = "absolute";
            this.popupWindow.style.left = "20px";
            this.popupWindow.style.top = "20px";
            this.popupWindow.style.width = "300px";
            this.popupWindow.style.height = "300px";

            this.windowMessageHandler = (evt) => {
                if (!evt.data || !evt.data.message || !evt.data.message.startsWith("causeverse")) {
                    return;
                }
                console.log(evt);
                if (evt.data.message === "causeverse-ready") {
                    resolve(true);
                }
            };
            window.addEventListener("message", this.windowMessageHandler);
            document.body.appendChild(this.popupWindow);
        });
    }

    addImage(data) {
        this.addPopup().then(() => {
            console.log("addImage", data);
            this.popupWindow.contentWindow.postMessage({type:"causeverse-addImage", url: data});
        });
    }
}

class PopUpButtonPawn {
    setup() {
        this.addEventListener("pointerTap", "addImage");
    }

    addImage() {
        console.log("tap");
        this.publish("popupWindow", "addImage", this.actor._cardData.textureLocation);
    }
}

class PopDownButtonPawn {
    setup() {
        this.addEventListener("pointerTap", "removePopup");
    }

    removePopup() {
        console.log("remove tap");
        this.publish("popupWindow", "popdown");
    }
}

export default {
    modules: [
        {
            name: "PopUpWindow",
            pawnBehaviors: [PopUpWindowPawn],
        },
        {
            name: "PopUpButton",
            pawnBehaviors: [PopUpButtonPawn],
        },
        {
            name: "PopDownButton",
            pawnBehaviors: [PopDownButtonPawn],
        }
    ]
}
