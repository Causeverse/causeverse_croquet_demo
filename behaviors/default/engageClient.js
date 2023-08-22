class EngageClientPawn {

	template() {
		return `
        <div style="position: absolute;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            padding: 10px;
            top: 10px;
            left: 80%;
			display: none;
            "class="engage-chat">
            <div>
                <button
                    id="join-btn"
                    style="background-color: green;
                        border: none;
                        padding: 10px;
                        color: #fff;
                    "
                >
                    Join voice chat
                </button>
                <button id="leave-btn"
                    style="display: none;
                        background-color: red;
                        border: none;
                        padding: 10px;
                        color: #fff;
                    "
                >
                    Leave voice chat
                </button>
                <button id="toggle-mute"
                    style="display: none;
                        background-color: green;
                        border: none;
                        padding: 10px;
                        color: #fff;
                    "
                >
                    Mute
                </button>
            </div>
            <div style="font-size: 14px;">
                People in chat:
                <span id="user-count">-</span>
            </div>
        </div>
        `
	}

	async setup() {
		this.rootDiv = document.createElement("div");
		document.body.appendChild(this.rootDiv);
		this.rootDiv.innerHTML = this.template();

		this.joinButton = this.rootDiv.querySelector("#join-btn");
		this.leaveButton = this.rootDiv.querySelector("#leave-btn");
		this.userCount = this.rootDiv.querySelector("#user-count");
		this.toggleMuteButton = this.rootDiv.querySelector("#toggle-mute");

		this.joinButton.addEventListener("click", async () => this.joinVoiceChat());
		this.leaveButton.addEventListener("click", async () => this.leaveVoiceChat());
		this.toggleMuteButton.addEventListener("click", async () => this.toggleMute());


		this.avatar = this.getMyAvatar().actor;
		this.player = this.getMyAvatar();

		if (!window.EngageClient) {
			await new Promise(resolve => {
				const script = document.createElement("script")
				script.setAttribute("src", "lib/atmoky-engage-client.js")
				script.onload = resolve;
				document.body.appendChild(script);
			})
		}
		this.space = await new window.EngageClient.Space({
			audioContext: new AudioContext(),
			numberOfDistanceModels: 10,
			numberOfAudioObjects: 10
		});
		window.engage = this.space;
		await this.joinSoundRoom();
		await this.joinSoundRoom();

		this.room = null;
		this.userCountSize = 0;

		// this.space.on("roomConnected", (room) => {
		// 	// const devices = await window.EngageClient.DeviceManager.getInstance().getDevices('audioinput');
		// 	// navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(error => error);
		// 	// console.log(devices);
		// 	this.room = room;
		// 	// if (this.room.name.includes("engage-video")) {
		// 	// 	return;
		// 	// }
		// 	if (this.room.name.includes("engage-voice-chat")) {
		// 		this.updateUserCount(room.participants.size + 1);
		// 		this.room.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
		// 		this.leaveButton.disabled = false;
		// 		this.toggleMuteButton.style.display = "initial";
		// 	}
		// 	this.subscribeToTranslation(this.room.localParticipant.identity);
		// 	this.subscribeToRotation(this.room.localParticipant.identity);
		// 	if (this.room.participants.size !== 0) {
		// 		this.room.participants.forEach((participant) => {
		// 			this.setParticipantSubscribe(participant.identity);
		// 		});
		// 	}
		// 	console.log(`Connected to room ${room.name}. Publishing microphone...`);
		// 	this.room.on("participantConnected", (participant) => {
		// 		// if (this.room.name.includes("engage-video")) {
		// 		// 	return;
		// 		// }
		// 		this.setParticipantSubscribe(participant.identity);
		// 		if (this.room.name.includes("engage-voice-chat")) {
		// 			this.updateUserCount(this.userCountSize + 1);
		// 		}
		// 	});
		//
		// 	this.room.on("participantDisconnected", (participant) => {
		// 		if (room.name.includes("engage-voice-chat")) {
		// 			this.updateUserCount(this.userCountSize !== 1 ? this.userCountSize - 1 : "-");
		// 		}
		// 	});
		//
		// 	this.room.on("activeSpeakersChanged", (participants) => {
		// 	});
		// })
	}

	soundsRoomEvents() {
		this.soundRoom.on("connected", () => {
			this.leaveButton.disabled = false;
			this.toggleMuteButton.style.display = "initial";

			this.subscribeToTranslation(this.soundRoom.localParticipant.identity);
			this.subscribeToRotation(this.soundRoom.localParticipant.identity);
		})
	}

	voiceRoomEvents() {
		this.voiceRoom.on("connected", () => {
			this.updateUserCount(this.voiceRoom.participants.size + 1);
			this.voiceRoom.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
			this.leaveButton.disabled = false;
			this.toggleMuteButton.style.display = "initial";

			this.subscribeToTranslation(this.voiceRoom.localParticipant.identity);
			this.subscribeToRotation(this.voiceRoom.localParticipant.identity);
			if (this.voiceRoom.participants.size !== 0) {
				this.voiceRoom.participants.forEach((participant) => {
					this.setParticipantSubscribe(participant.identity);
				});
			}
		})

		this.voiceRoom.on("participantConnected", (participant) => {
			this.setParticipantSubscribe(participant.identity);
			this.updateUserCount(this.userCountSize + 1);
		});

		this.voiceRoom.on("participantDisconnected", (participant) => {
			console.log(participant);
			this.unsubscribe(participant.identity, "translateTo", this.remoteParticipantTranslate);
			this.updateUserCount(this.userCountSize !== 1 ? this.userCountSize - 1 : "-");
		});
	}

	updateUserCount(numParticipants) {
		this.userCountSize = numParticipants;
		this.userCount.innerText = numParticipants;
	}

	setParticipantSubscribe(id) {
		this.subscribe(id, "translateTo", this.remoteParticipantTranslate);
	}

	remoteParticipantTranslate() {
		this.actor.service("PlayerManager").players.forEach(player => {
			const [x, y, z] = player._translation;
			if (this.player._actor.id !== player.id) {
				const remoteParticipant = this.voiceRoom.getParticipantByIdentity(player.id);
				if (remoteParticipant) {
					remoteParticipant.setPosition(x, y, z);
				}
			}
		})
	}

	subscribeToTranslation(id) {
		this.subscribe(id, "translateTo", this.setTranslation);
	}

	setTranslation(data) {
		const [x, y, z] = data;
		this.space.audioListener.setPosition(x, y, z);
	}

	subscribeToRotation(id) {
		this.subscribe(id, "rotateTo", this.setRotation);
	}

	setRotation(data) {
		const [x, y, z, w] = data;
		this.space.audioListener.setRotationQuaternion(w, x, y, z);
	}

	async leaveVoiceChat () {
		await this.voiceRoom.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
		this.voiceRoom.leave();
		this.joinButton.style.display = "initial";
		this.leaveButton.style.display = "none";
		this.toggleMuteButton.style.display = "none";
		this.toggleMuteButton.style.background = "green";
		this.toggleMuteButton.innerHTML = "Mute";
		this.updateUserCount("-");
	}

	async toggleMute() {
		if (this.voiceRoom.localParticipant.isMicrophoneEnabled) {
			this.toggleMuteButton.style.background = "red";
			this.toggleMuteButton.innerHTML = "Unmute";
			await this.voiceRoom.localParticipant.setMicrophoneEnabled(false, {echoCancellation: true});
		} else {
			this.toggleMuteButton.style.background = "green";
			this.toggleMuteButton.innerHTML = "Mute";
			await this.voiceRoom.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
		}
	}
	async joinSoundRoom () {
		this.space.resumeAudio();
		const { token } = await this.getToken();
		const url = "https://causeverse-6fxnof34.livekit.cloud/";

		this.soundRoom = this.space.joinRoom(url, token);
	}

	async joinVoiceChat () {
		this.joinButton.style.display = "none";
		this.leaveButton.style.display = "initial";
		this.leaveButton.disabled = true;
		await this.space.resumeAudio();
		const { token } = await this.getVoiceToken();
		const url = "https://causeverse-6fxnof34.livekit.cloud/";

		this.voiceRoom = this.space.joinRoom(url, token);
		this.voiceRoomEvents();
	}

	async getVoiceToken() {
		const participantName = this.avatar.id;
		const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token",{
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName: `engage-voice-chat-${this.sessionId}`,
				participantName
			})
		});
		return await response.json();
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
				roomName: `engage-sounds ${Math.floor(Math.random()*(999-100+1)+100)}${this.sessionId}`,
				participantName
			})
		});
		return await response.json();
	}

	teardown() {
		this.space.removeAllAudioObjects();
		this.space.leaveAllRooms();
	}
}

export default {
	modules: [
		{
			name: "EngageClient",
			pawnBehaviors: [EngageClientPawn],
		},
	]
}