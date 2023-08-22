class EngageScreenSharePawn {

	async setup() {
		const tokenP = this.getToken()
		await new Promise(resolve => setTimeout(resolve, 4000))
		this.space = window.engage

		const { token } = await tokenP
		const url = "https://causeverse-6fxnof34.livekit.cloud/";
		this.room = this.space.joinRoom(url, token);

		this.room.on("connected", () => {
			this.room.participants.forEach(participant => {
				if (participant.isScreenShareEnabled) {
					this.screenShareTaken = true
					const publication = [...participant.videoTracks.values()].find(({ source }) => source === "screen_share")
					this.renderSharedScreen(publication, participant)
				}
			})
		})
		this.room.on("trackPublished", (publication, participant) => {
			this.renderSharedScreen(publication, participant)
		})

		this.addEventListener("pointerTap", "tapped");

		const geometry = new Microverse.THREE.PlaneGeometry(2*640/360, 2)
		this.video = document.createElement("video")
		document.body.appendChild(this.video)
		this.texture = new Microverse.THREE.VideoTexture(this.video)
		this.defaultMaterial = new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, color: "#0b0b0b" })
		this.videoMaterial = new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, map: this.texture })
		this.mesh = new Microverse.THREE.Mesh(geometry, this.defaultMaterial)
		this.shape.add(this.mesh)
	}

	async getToken() {
		const participantName = this.getMyAvatar().actor.id
		const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token",{
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName: `engage-screen-share-${this.sessionId}`,
				participantName
			})
		});
		return await response.json();
	}

	renderSharedScreen(publication, participant) {
		this.screenShareTaken = true
		publication.on("subscribed", track => {
			track.attach(this.video)
			this.mesh.material = this.videoMaterial
		})
		publication.setSubscribed(true)
		participant.on("trackUnpublished", publication => {
			if (publication.source === "screen_share") {
				this.screenShareTaken = false
				this.mesh.material = this.defaultMaterial
			}
		})
	}

	async tapped() {
		if (this.room.localParticipant.isScreenShareEnabled) {
			await this.room.localParticipant.setScreenShareEnabled(false)
			this.mesh.material = this.defaultMaterial
		} else {
			if (this.screenShareTaken) return
			await this.authorize()
			const publication = await this.room.localParticipant.setScreenShareEnabled(true)
			publication.track.attach(this.video)
			this.mesh.material = this.videoMaterial
		}
	}



    async isValidCode(code) {
        return (await this.sha256(code)) === "8d27ba37c5d810106b55f3fd6cdb35842007e88754184bfc0e6035f9bcede633"
    }

    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        return hashHex
    }

    async authorize() {
        const saved = window.localStorage.getItem("adminCode")
        if (await this.isValidCode(saved)) {
            return true
        }
        const div = document.createElement("div")
        div.innerHTML = `
        <div style="padding: 20px; position: absolute; z-index: 9000; left: 50%;
            top: 50%; background-color: grey; transform: translate(-50%, -50%);
            text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5); border-radius: 8px; background-color: rgba(0, 0, 0, 0.5);
            ">
            <form>
                <span>code:</span>
                <input />
            </form>
        </div>
        `
        const events = ["click", "contextmenu", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove",
            "mouseover", "mouseout", "mouseup", "keydown", "keypress", "keyup", "blur", "change", "focus", "focusin",
            "focusout", "input", "invalid", "reset", "search", "select", "submit", "drag", "dragend", "dragenter",
            "dragleave", "dragover", "dragstart", "drop", "copy", "cut", "paste", "mousewheel", "wheel", "touchcancel",
            "touchend", "touchmove", "touchstart", "pointerdown", "pointerup",]
        events.forEach(event => {
            div.addEventListener(event, e => e.stopPropagation())
        })
        const form = div.querySelector("form")
        const input = div.querySelector("input")
        const span = div.querySelector("span")
        document.body.appendChild(div)
        return new Promise((resolve, reject) => {
            form.onsubmit = async (e) => {
                e.preventDefault()
                const code = input.value
                if (await this.isValidCode(code)) {
                    window.localStorage.setItem("adminCode", code)
                    resolve(true)
                } else {
                    span.innerText = "INVALID"
                    input.style.display = "none"
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    reject()
                }
                div.remove()
            }
        })
    }
}



export default {
	modules: [
		{
			name: "EngageScreenShare",
			pawnBehaviors: [EngageScreenSharePawn],
		},
	]
}
