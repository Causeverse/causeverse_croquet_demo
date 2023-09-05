class DiscordWidgetPawn {
    setup() {
        if (document.getElementById("discord-script-tag")) {
            return;
        }
        const serverId = "1148354710772908032";
        const channelId = "1148354710772908035";

        const dom = document.createElement("script");
        dom.async = true;
        dom.defer = true;
        dom.src = "https://cdn.jsdelivr.net/npm/@widgetbot/crate@3";
        dom.innerHTML = `new Crate({
        server: '${serverId}',
        channel: '${channelId}',
        location: [12, -80]
        })`;
        document.body.appendChild(dom);

        /*
        const discordBtn = document.getElementById("discordBtn");
        console.log("discord setup", discordBtn);

        const instance = this;
        if (discordBtn) {
            discordBtn.onclick = function (e) {
                console.log("discord click");
                e.preventDefault();
                instance.popUp();
            };
        }
        */
    }

    popUp() {
        /*
        if (this.popupWindow) {
            this.popupWindow.remove();
            delete this.popupWindow;
            return;
        }

        this.popupWindow = document.createElement("iframe");
        this.popupWindow.src = `https://discord.com/widget?id=${serverId}&theme=dark" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts`;

        this.popupWindow.style.position = "fixed";
        this.popupWindow.style.top = "unset";
        this.popupWindow.style.left = "30px";
        this.popupWindow.style.right = "unset";
        this.popupWindow.style.bottom = "130px";
        this.popupWindow.style.width = "800px";
        this.popupWindow.style.height = "500px";

        this.popupWindow.style.zIndex = 1000;

        document.body.appendChild(this.popupWindow);
        */
    }
}

export default {
    modules: [
        {
            name: "DiscordWidget",
            pawnBehaviors: [DiscordWidgetPawn],
        },
    ],
};
