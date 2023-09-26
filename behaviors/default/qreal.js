class QRealPawn {
    setup() {
        let qrealBtn = document.getElementById("qrealBtn");
        if (!qrealBtn) {
            qrealBtn = document.createElement("div");
            qrealBtn.className = "btn btn-ui";
            qrealBtn.id = "qrealBtn";
            qrealBtn.style.top = "10px";
            qrealBtn.style.left = "100px";
            qrealBtn.innerHTML = `<i class="fas fa-eye"></i>`;
            qrealBtn = document.querySelector("#fullscreenBtn").insertAdjacentElement("afterend", qrealBtn);

            const instance = this;
            qrealBtn.onclick = function (e) {
                console.log("qreal click");
                e.preventDefault();
                instance.popUp();
            };
        }
    }

    popUp() {
        if (this.popupWindow) {
            this.popupWindow.remove();
            delete this.popupWindow;
            return;
        }
        const modelId = "vans-era-colormix";

        this.popupWindow = document.createElement("div");
        this.popupWindow.innerHTML = `<qreal-model-viewer modelId="${modelId}"/>`;

        this.popupWindow.id = "qreal_viewer";
        this.popupWindow.style.position = "absolute";
        this.popupWindow.style.left = "20px";
        this.popupWindow.style.top = "100px";
        this.popupWindow.style.width = "600px";
        this.popupWindow.style.height = "600px";
        this.popupWindow.style.backgroundColor = "rgba(0,0,0,0.4)";
        this.popupWindow.style.borderRadius = "1rem";
        this.popupWindow.style.boxShadow = "0 0 1rem rgba(0,0,0,0.4)";

        this.popupWindow.style.zIndex = 1000;

        document.body.appendChild(this.popupWindow);
    }
}

export default {
    modules: [
        {
            name: "QReal",
            pawnBehaviors: [QRealPawn],
        },
    ],
};
