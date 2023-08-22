class EngageVideoPawn {

	async setup() {
		this.future(4000).getEngageClient();

		this.addEventListener("pointerTap", "startVideo");

		this.placeholderMesh = this.createPlaneMesh();
		this.placeholderMesh.position.set(...this.getScreenPosition(0));
		this.shape.add(this.placeholderMesh);

		this.avatar = this.getMyAvatar().actor;
		this.player = this.getMyAvatar();

		this.room = null;
		this.toggleVideo = false;
		this.videoUsers = new Map();
	}

	async handleRoomEvents() {
		this.room.on("connected", () => {
			if (this.room.participants && this.room.participants.size) {
				this.room.participants.forEach(participant => {
					participant.on("trackPublished", publication => {
						this.subscribeToVideoPublication(participant.identity, publication);
					});
				})

				this.room.participants.forEach(participant => {
					const publication = participant.getTrack("camera");
					if (publication) {
						this.subscribeToVideoPublication(participant.identity, publication);
					}
				});

				this.room.participants.forEach(participant => {
					participant.on("trackUnsubscribed", (track) => {
						if (track.source === "camera") {
							const user = this.videoUsers.get(track.sid);
							track.detach(user.videoElement);
							this.shape.remove(user.mesh);
							this.videoUsers.delete(track.sid);
							const element = document.getElementById(track.sid);
							element.remove();
							this.updateScreenPositions();

							this.placeholderMesh.visible = this.videoUsers.size === 0
						}
					});
				})
			}
		});

		this.room.on("participantConnected", (participant) => {
			participant.on("trackPublished", this.subscribeToVideoPublication.bind(this, participant.identity));
			participant.on("trackUnsubscribed", async (track) => {
				if (track.source === "camera") {
					const user = this.videoUsers.get(track.sid);
					track.detach(user.videoElement);
					this.shape.remove(user.mesh);
					this.videoUsers.delete(track.sid);
					const element = document.getElementById(track.sid);
					element.remove();
					this.updateScreenPositions();
					this.placeholderMesh.visible = this.videoUsers.size === 0;
				}
			});
		});
	}

	async subscribeToVideoPublication(identity, publication) {
		if (publication.source === "camera") {
			publication.on("subscribed", (track) => {
				const videoElement = document.createElement("video");
				videoElement.id = publication.trackSid;
				videoElement.style.position = "absolute";
				videoElement.style.zIndex = "-1";
				videoElement.style.width = "50px";
				videoElement.style.top = "0";
				document.body.appendChild(videoElement);
				const texture = new Microverse.THREE.VideoTexture(videoElement);
				const mesh = this.createPlaneMesh(texture);
				track.attach(videoElement);
				this.shape.add(mesh);
				this.videoUsers.set(publication.trackSid, {
					videoElement,
					mesh,
					publication,
					texture
				});
				videoElement.style.left = `${50 * this.getUserIndex(publication.trackSid)}px`;

				this.updateScreenPositions();
			});
			publication.setSubscribed(true);
		}
	};

	async getEngageClient() {
		this.space = window.engage;
		await this.joinVideoRoom();
		await this.handleRoomEvents();
	}

	async startVideo() {
		if (this.toggleVideo) {
			const publication = this.room.localParticipant.getTrack("camera");
			this.room.localParticipant.unpublishTrack(publication.track, true);
			const user = this.videoUsers.get(publication.trackSid);
			this.shape.remove(user.mesh);
			this.videoUsers.delete(publication.trackSid);
			const videoElement = document.getElementById(publication.trackSid);
			videoElement.remove();
			this.updateScreenPositions();
			this.toggleVideo = false;
		} else {
			if (this.keyCodePanel) {
				return;
			} else {
				await this.askPasscode();

			}
			const videoElement = document.createElement("video");
			document.body.appendChild(videoElement);
			videoElement.style.position = "absolute";
			videoElement.style.zIndex = "-1";
			videoElement.style.width = "50px";
			videoElement.style.top = "0";
			await this.room.localParticipant.setCameraEnabled(true);
			const publication = this.room.localParticipant.getTrack("camera");
			videoElement.id = publication.trackSid;
			publication.track.attach(videoElement);
			const texture = new Microverse.THREE.VideoTexture(videoElement)
			const mesh = this.createPlaneMesh(texture);
			this.shape.add(mesh);

			this.videoUsers.set(publication.trackSid, {
				publication,
				mesh,
				texture,
				videoElement
			});
			videoElement.style.left = `${50 * this.getUserIndex(publication.trackSid)}px`;
			this.updateScreenPositions();
			this.toggleVideo = true;
		}
	}

	updateScreenPositions() {
		this.videoUsers.forEach(({ mesh }, identity) => {
			mesh.position.set(...this.getScreenPosition(this.getUserIndex(identity)))
		})
		this.placeholderMesh.visible = this.videoUsers.size === 0
	}

	getUserIndex(identity) {
		const ix = [...this.videoUsers.keys()].sort().findIndex(x => x === identity)
		if (ix === -1) throw new Error(`engage user ${identity} is not in videoUsers`)
		return ix
	}

	initAudio() {
		this.firstClickCb = this.onFirstClick.bind(this)
		document.body.addEventListener("pointerdown", this.firstClickCb)
	}

	async onFirstClick() {
		document.body.removeEventListener("pointerdown", this.firstClickCb)
		this.firstClickCb = null
		this.startAudio()
	}
	createPlaneMesh(texture) {
		const geometry = new Microverse.THREE.PlaneGeometry(2*640/360, 2)
		const material = texture
			?  new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, map: texture })
			:  new Microverse.THREE.MeshBasicMaterial({ side: Microverse.THREE.DoubleSide, color: "#0b0b0b" })
		const mesh = new Microverse.THREE.Mesh(geometry, material)
		return mesh
	}

	getScreenPosition(ix) {
		const level = Math.floor(ix/2)
		const side = ix % 2
		return [side*4, level*2.2, 0]
	}

	teardown() {
		this.space.removeAllAudioObjects();
		this.space.leaveAllRooms();
	}

	async joinVideoRoom () {
		const { token } = await this.getToken();
		const url = "https://causeverse-6fxnof34.livekit.cloud/";

		this.room = this.space.joinRoom(url, token);
	}

	async getToken() {
		const participantName = this.avatar.id;
		const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token",{
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName: `engage-video-${this.sessionId}`,
				participantName
			})
		});
		return await response.json();
	}

	async askPasscode() {
		this.keyCodePanel = true;
		const div = document.createElement("div")
		div.innerHTML = `
        <div style="padding: 20px; position: absolute; z-index: 9000; left: 50%;
            top: 50%; background-color: grey; transform: translate(-50%, -50%);
            text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5); border-radius: 8px; background-color: rgba(0, 0, 0, 0.5);
            ">
            <form>
                <span>code:</span>
                <input autofocus />
            </form>
        </div>
        `
		const events = ["click", "contextmenu", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove",
			"mouseover", "mouseout", "mouseup", "keydown", "keypress", "keyup", "blur", "change", "focus", "focusin",
			"focusout", "input", "invalid", "reset", "search", "select", "submit", "drag", "dragend", "dragenter",
			"dragleave", "dragover", "dragstart", "drop", "copy", "cut", "paste", "mousewheel", "wheel", "touchcancel",
			"touchend", "touchmove", "touchstart"]
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
				if (await this.sha256(code) === "8d27ba37c5d810106b55f3fd6cdb35842007e88754184bfc0e6035f9bcede633") {
					resolve()
					this.keyCodePanel = false;
				} else {
					span.innerText = "INVALID"
					input.style.display = "none"
					await new Promise(resolve => setTimeout(resolve, 1000))
					reject();
					this.keyCodePanel = false;
				}
				div.remove()
			}
		})
	}

	async sha256(message) {
		const msgBuffer = new TextEncoder().encode(message)
		const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
		return hashHex
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
