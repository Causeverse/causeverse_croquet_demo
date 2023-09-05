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
