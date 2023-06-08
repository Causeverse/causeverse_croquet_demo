class PopUpButtonPawn {
    setup() {
        this.addEventListener("pointerTap", "popUp");
    }

    popUp() {
        // debugger;
        if (this.popupWindow) {
            this.popupWindow.remove();
            delete this.popupWindow;
            return;
        }

        this.popupWindow = document.createElement("iframe");
        this.popupWindow.src = "https://causeverse.io";

        this.popupWindow.width = 800;
        this.popupWindow.height = 800;
        this.popupWindow.style.position = "absolute";
        this.popupWindow.style.left = "20px";
        this.popupWindow.style.top = "20px";
        this.popupWindow.style.width = "800px";
        this.popupWindow.style.height = "600px";

        this.popupWindow.style.zIndex = 1000;

        document.body.appendChild(this.popupWindow);
    }
}

export default {
    modules: [
        {
            name: "PopUpButton",
            pawnBehaviors: [PopUpButtonPawn],
        }
    ]
}
