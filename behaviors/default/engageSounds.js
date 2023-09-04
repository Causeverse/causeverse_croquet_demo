class EngageSoundPawn {
	async setup() {
		this.space = await window.engage;
		await this.space.spatialAudioInitializedPromise;

		this.setDistance();
		this.prepareAudioObject();
		this.addEventListener("pointerTap", "turnMusicOn");

		this.avatar = this.getMyAvatar().actor;
		this.player = this.getMyAvatar();
		this.handler = () => this.start();
		document.addEventListener("pointerdown", this.handler);
	}


	async start() {
		if (this.handler) {
			document.removeEventListener("pointerdown", this.handler);
			delete this.handler;
			this.space.resumeAudio();
			console.log("starting");
		}
	}

	getEngageClient() {
		this.space = window.engage;
		this.setDistance();
		this.prepareAudioObject();
	}

	prepareAudioObject() {
		this.audioElement = new Audio()
		this.audioElement.crossOrigin = "anonymous"
		this.audioElement.src = this.actor._cardData.soundLocation
		this.source = this.space.spatialAudio.audioContext.createMediaElementSource(this.audioElement)

		this.audioObject = this.space.createAudioObject();
		this.audioObject.setGainLinear(this.actor._cardData.gainLinear);
		if (this.actor._cardData.soundType === "universal") {
			this.audioObject.setPositionMode("headlocked");
		} else if (this.actor._cardData.soundType === "proximity") {
			this.audioObject.setDistanceModel(this.distanceName);
			this.audioObject.setReverbDistanceModel(...this.actor._cardData.distanceMode);
			this.audioObject.setPosition(...this.actor._cardData.soundPositions);
		}
		this.audioObject.setInput(this.source)

		if (this.actor._cardData.interactive) {
			this.audioElement.loop = false
		} else {
			this.audioElement.loop = true
			this.ensurePlay()
		}
	}

	async ensurePlay() {
		try {
			this.audioElement.play()
		} catch (e) {
			this.future(1000).ensurePlay()
		}
	}

	setDistance() {
		if (this.actor._cardData.soundType === "proximity") {
			this.distanceName = this.space.distanceModels[this.actor._cardData.index];
			this.distanceName.name = `distance${this.actor._cardData.index}`;
			this.distanceName.setDataPoints(...this.actor._cardData.distanceMode);
		}
	}

	turnMusicOn() {
		if (this.audioElement.paused) {
			this.audioElement.play();
		} else {
			this.audioElement.pause();
		}
	}

	teardown() {
		this.space.removeAllAudioObjects();
		this.space.leaveAllRooms();
	}
}

export default {
	modules: [
		{
			name: "EngageSound",
			pawnBehaviors: [EngageSoundPawn],
		},
	]
}
