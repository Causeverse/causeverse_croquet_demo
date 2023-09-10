class EngageClientPawn {

    template() {
        return `
        <div style="position: absolute;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            padding: 10px;
            top: 10px;
            left: 80%;
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

        this.volumeMap = {
            0: 0,
            10: 0.1,
            20: 0.2,
            30: 0.3,
            40: 0.4,
            50: 0.5,
            60: 0.6,
            70: 0.7,
            80: 0.8,
            90: 0.9,
            100: 1
        }

        this.joinButton = this.rootDiv.querySelector("#join-btn");
        this.leaveButton = this.rootDiv.querySelector("#leave-btn");
        this.userCount = this.rootDiv.querySelector("#user-count");
        this.toggleMuteButton = this.rootDiv.querySelector("#toggle-mute");

        this.joinButton.addEventListener("click", async () => this.joinVoiceChat());
        this.leaveButton.addEventListener("click", async () => this.leaveVoiceChat());
        this.toggleMuteButton.addEventListener("click", async () => this.toggleMute());

        this.avatar = this.getMyAvatar().actor;
        this.player = this.getMyAvatar();

        window.engage = new Promise(resolve => {
            if (!window.EngageClient) {
                const script = document.createElement("script")
                script.setAttribute("src", "assets/src/atmoky-engage-client.js")
                script.onload = async () => {
                    this.space = await new window.EngageClient.Space({
                        audioContext: new AudioContext(),
                        numberOfDistanceModels: 20,
                        numberOfAudioObjects: 20
                    });
                    resolve(this.space);
                };
                document.body.appendChild(script);
            } else {
                new window.EngageClient.Space({
                    audioContext: new AudioContext(),
                    numberOfDistanceModels: 20,
                    numberOfAudioObjects: 20
                }).then(resolve);
            }
        })

        this.space = await window.engage;
        await this.space.spatialAudioInitializedPromise;
        await this.joinSoundRoom();
        this.room = null;
        this.userCountSize = 0;

        this.currentIncomingVolume = window.incomingMicVolume;
        this.currEnvVolume = window.envVolume;
        this.handleEnvVolumeChanged(this.currEnvVolume);

        this.subscribe(this.player.getMyAvatar().id, "incomingVolumeChanged", this.handleIncomingVolumeChanged);
        this.subscribe(this.player.getMyAvatar().id, "envVolumeChanged", this.handleEnvVolumeChanged);
    }

    handleIncomingVolumeChanged(volumeLevel) {
        this.currentIncomingVolume = volumeLevel;
        if (this.room && this.room.participants.size) {
            this.room.participants.forEach(participant => participant.setGainLinear(this.volumeMap[this.currentIncomingVolume]));
        }
    }

    handleEnvVolumeChanged(volumeLevel) {
        this.currEnvVolume = volumeLevel;
        this.soundRoom.space.spatialAudio.objects.forEach(obj => {
            if (obj.input && obj.input.mediaElement && obj.isConnected) {
                obj.setGainLinear(this.volumeMap[this.currEnvVolume]);
            }
        })
    }
    soundRoomsEvents() {
        this.soundRoom.on("connected", () => {
            this.subscribeToTranslation(this.soundRoom.localParticipant.identity);
            this.subscribeToRotation(this.soundRoom.localParticipant.identity);
        })
    }
    roomEvents() {
        this.room.on("connected", () => {
            this.room.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
            this.updateUserCount(this.room.participants.size + 1);
            this.leaveButton.disabled = false;

            this.subscribeToTranslation(this.room.localParticipant.identity);
            this.subscribeToRotation(this.room.localParticipant.identity);

            if (this.room.participants.size !== 0) {
                this.room.participants.forEach((participant) => {
                    participant.setGainLinear(this.volumeMap[this.currentIncomingVolume]);
                    this.setParticipantSubscribe(participant.identity);
                });
            }
        });

        this.room.on("participantConnected", (participant) => {
            this.setParticipantSubscribe(participant.identity);
            this.updateUserCount(this.userCountSize + 1);
            participant.setGainLinear(this.volumeMap[this.currentIncomingVolume]);
        });

        this.room.on("participantDisconnected", (participant) => {
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
                const remoteParticipant = this.room.getParticipantByIdentity(player.id);
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

    async leaveVoiceChat() {
        this.room.leave();
        this.joinButton.style.display = "initial";
        this.leaveButton.style.display = "none";
        this.toggleMuteButton.style.display = "none";
        this.toggleMuteButton.style.background = "green";
        this.toggleMuteButton.innerHTML = "Mute";
        this.updateUserCount("-");
    }

    async joinVoiceChat() {
        await this.joinRoom();
        this.toggleMuteButton.style.display = "initial";
        this.joinButton.style.display = "none";
        this.leaveButton.style.display = "initial";
    }

    async toggleMute() {
        if (this.room.localParticipant.isMicrophoneEnabled) {
            this.toggleMuteButton.style.background = "red";
            this.toggleMuteButton.innerHTML = "Unmute";
            await this.room.localParticipant.setMicrophoneEnabled(false, {echoCancellation: true});
        } else {
            this.toggleMuteButton.style.background = "green";
            this.toggleMuteButton.innerHTML = "Mute";
            await this.room.localParticipant.setMicrophoneEnabled(true, {echoCancellation: true});
        }
    }

    async joinRoom() {
        await this.space.resumeAudio();
        const {token} = await this.getToken();
        const url = "https://causeverse-6fxnof34.livekit.cloud/";

        this.room = await this.space.joinRoom(url, token);
        await this.roomEvents();
    }

    async getToken() {
        const participantName = this.avatar.id;
        const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName: `engage-voice-chat${this.sessionId}`,
                participantName
            })
        });
        return await response.json();
    }

    teardown() {
        this.space.removeAllAudioObjects();
        this.space.leaveAllRooms();
    }

    async joinSoundRoom() {
        this.space.resumeAudio();
        const { token } = await this.getSoundToken();
        const url = "https://causeverse-6fxnof34.livekit.cloud/";

        this.soundRoom = await this.space.joinRoom(url, token);
        this.soundRoomsEvents();
    }

    async getSoundToken() {
        const participantName = this.avatar.id;
        const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token",{
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName: `engage-sound-room-${this.sessionId}`,
                participantName
            })
        });
        return await response.json();
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