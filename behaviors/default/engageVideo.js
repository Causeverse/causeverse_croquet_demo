
import { PawnBehavior } from "../PrototypeBehavior"

class EngageVideoPawn extends PawnBehavior {
	async setup() {
		this.SCREEN_ASPECT_RATIO = 16/9

		this.cleanup()

		if (!window.engage) {
			window.engage = new Promise((resolve, reject) => {
				const script = document.createElement("script")
				script.setAttribute("src", "assets/src/atmoky-engage-client.js")
				script.onload = () => {
					try {
						resolve(new window.EngageClient.Space({
							audioContext: new AudioContext(),
							numberOfDistanceModels: 20,
							numberOfAudioObjects: 20
						}))
					} catch(e) {
						reject(e)
					}
				}
				document.body.appendChild(script)
			})
		}

		const tokenP = this.getToken()
		this.space = await window.engage;

		const { token } = await tokenP
		const url = "https://causeverse-6fxnof34.livekit.cloud/";
		this.room = this.space.joinRoom(url, token);

		this.room.on("connected", () => {
			this.room.participants.forEach(participant => {
				if (participant.isCameraEnabled) {
					const publication = [...participant.videoTracks.values()][0]
					if (publication) {
						this.renderRemoteVideo(publication, participant)
					}
				}
			})
		})

		this.room.on("trackPublished", (publication, participant) => {
			this.renderRemoteVideo(publication, participant)
		})

		this.addEventListener("pointerTap", "tapped");

		const geometry = new Microverse.THREE.PlaneGeometry(2*this.SCREEN_ASPECT_RATIO, 2)
		this.video = document.createElement("video")
		this.texture = new Microverse.THREE.VideoTexture(this.video)
		this.texture.center.set(0.5, 0.5)
        this.texture.colorSpace = Microverse.THREE.SRGBColorSpace
		this.defaultMaterial = new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, color: 0x0b0b0b })
		this.videoMaterial = new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, map: this.texture })
		this.mesh = new Microverse.THREE.Mesh(geometry, this.defaultMaterial)
		this.shape.add(this.mesh)
	}

	cleanup() {
		//TODO
		if (this.room) {
			this.room.leave()
		}
	}

	async getToken() {
		// TODO: currently creating a separate room for each video card, is ok?
		const roomName = `engage-video-${this.sessionId}-${this.id}`
		console.log("room name", roomName)
		const participantName = this.getMyAvatar().actor.id
		const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				roomName,
				participantName,
			})
		})
		return await response.json()
	}

	// TODO: switch away from polling when engage provides a better mechanism
	pollAspectRatio() {
		// NOTE: video is clipped to fit the screen if aspect ratios don't match
		const track = (this.localTrack || this.remoteTrack)
		if (track) {
			const { aspectRatio } = track.mediaStreamTrack.getSettings()
			if (aspectRatio) {
				const desiredRepeat =
					aspectRatio > this.SCREEN_ASPECT_RATIO
						? new Microverse.THREE.Vector2(this.SCREEN_ASPECT_RATIO/aspectRatio, 1)
						: new Microverse.THREE.Vector2(1, aspectRatio/this.SCREEN_ASPECT_RATIO)
				if (!this.texture.repeat.equals(desiredRepeat)) {
					this.texture.repeat.copy(desiredRepeat)
				}
			}
			this.future(1000).pollAspectRatio()
		}
	}

	renderRemoteVideo(publication, participant) {
		this.screenTaken = true
		publication.on("subscribed", async track => {
			this.remoteTrack = track
			this.mesh.material = this.videoMaterial
			track.attach(this.video)
			let playing = false
			while (!playing) {
				try {
					this.video.play()
					playing = true
				} catch (e) {
					await new Promise(resolve => window.setTimeout(resolve, 1000))
				}
			}
		})
		publication.setSubscribed(true)
		participant.on("trackUnpublished", publication => {
			this.screenTaken = false
			this.remoteTrack = null
			this.mesh.material = this.defaultMaterial
		})
		this.pollAspectRatio()
	}

	// TODO: there might be a race condition when two people try to take the same screen simultaneously
	async tapped() {
		if (this.localTrack) {
			await this.room.localParticipant.setCameraEnabled(false)
			this.room.localParticipant.unpublishTrack(this.localTrack)
			this.localTrack = null
			this.mesh.material = this.defaultMaterial
		} else {
			if (this.screenTaken) return
			await this.authorize()
			if (this.screenTaken) return // NOTE: in case someone took it while you were filling the code
			const publication = await this.room.localParticipant.setCameraEnabled(true)
			publication.track.attach(this.video)
			this.localTrack = publication.track
			this.mesh.material = this.videoMaterial
			this.video.play()
			this.pollAspectRatio()
		}
	}



	// TODO: lmao xD
	
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
			name: "EngageVideo",
			pawnBehaviors: [EngageVideoPawn],
		},
	]
}
