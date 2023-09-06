class DiscordWidgetPawn {
    setup() {
        if (document.getElementById("discord-script-tag")) {
            return;
        }
        const serverId = "1148354710772908032";
        const channelId = "1148354710772908035";

        const dom = document.createElement("script");
        dom.id = "discord-script-tag";
        dom.async = true;
        dom.defer = true;
        dom.src = "https://cdn.jsdelivr.net/npm/@widgetbot/crate@3";
        dom.innerHTML = `window.crate = new Crate({
        server: '${serverId}',
        channel: '${channelId}',
        location: [12, -80]
        })`;
        document.body.appendChild(dom);

        window.top.addEventListener("beforeunload", function (e) {
            crate.emit("logout");

            const value = "You are about to sign out from the Discord. Are you sure?";
            e.returnValue = value;
        });
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
