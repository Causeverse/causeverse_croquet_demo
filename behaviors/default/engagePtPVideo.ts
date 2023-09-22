import { Group, Mesh, Texture } from "three"
import { ActorBehavior, PawnBehavior, AvatarActor } from "../PrototypeBehavior"

type Call = { peer1: string, peer2: string }

class EngagePtPVideoActor extends ActorBehavior {
	calls: Set<Call>

	setup() {
		if (!this.calls) {
			this.calls = new Set()
		}

		this.listen("initCall", "initCall")
		this.listen("endCall", "endCall")
		this.listen("invalidCall", "invalidCall")
		this.listen("callFailed", "endCall")
	}

	initCall({ peer1, peer2 }: Call) {
		const all = this.currentPeers()
		if (all.has(peer1) || all.has(peer2)) return

		this.calls.add({ peer1, peer2 })
		this.say("callStarted", { peer1, peer2 })
	}

	endCall(peerId: string) {
		const call = [...this.calls].find(({ peer1, peer2 }) => peer1 === peerId || peer2 === peerId)
		if (call) {
			this.calls.delete(call)
			this.say("callEnded", call)
		}
	}

	invalidCall(peerId: string) {
		const call = [...this.calls].find(({ peer1, peer2 }) => peer1 === peerId || peer2 === peerId)
		if (call) {
			this.calls.delete(call)
		}
	}

	currentPeers() {
		return new Set([...this.calls].flatMap(({ peer1, peer2 }) => [peer1, peer2]))
	}
}


type RemotePlayerStuff = {
	id: string
	g: Group
	callButton: Mesh
	joinedAt: number
	dispose: () => void
}

class EngagePtPVideoPawn extends PawnBehavior {
	myPlayerId: string
	currentCall: null | {
		peerId: string
		room: any
		peerMesh?: Mesh
		texture?: Texture
		track?: any
	}
	players: Map<string, RemotePlayerStuff>

	async setup() {
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


		this.myPlayerId = this.getMyAvatar().actor._playerId

		if (this.isPlayerInCall(this.myPlayerId)) {
			this.say("invalidCall", this.myPlayerId)
		}

		this.players = new Map()
		this.actor.service("PlayerManager").players.forEach(player => {
			if (player._playerId !== this.myPlayerId) {
				this.initRemotePlayer(player)
			}
		})

		this.subscribe("playerManager", "enter", this.playerEnter)
		this.subscribe("playerManager", "leave", this.playerLeave)
		this.subscribe(this.getMyAvatar().actor.id, "translateTo", this.playerMoved)
		this.addEventListener("pointerDown", this.tapped)
		this.listen("callStarted", this.callStarted)
		this.listen("callEnded", this.callEnded)
	}

	cleanup() {
		this.players?.forEach(remotePlayer => this.dropRemotePlayer(remotePlayer))
		if (this.currentCall) {
			this.currentCall.room.leave()
			this.currentCall.peerMesh?.removeFromParent()
			this.currentCall.texture?.dispose()
			this.currentCall = null
		}
	}

	teardown() {
		this.cleanup()
	}

	pollVideoAspectRatio() {
		if (this.currentCall?.track) {
			const { aspectRatio } = this.currentCall.track.mediaStreamTrack.getSettings()
			if (aspectRatio) {
				const texture = this.currentCall.texture!
				const desiredRepeat =
					aspectRatio > 1
						? new Microverse.THREE.Vector2(1/aspectRatio, 1)
						: new Microverse.THREE.Vector2(1, aspectRatio)
				if (!texture.repeat.equals(desiredRepeat)) {
					texture.repeat.copy(desiredRepeat)
				}
			}
			this.future(1000).pollVideoAspectRatio()
		}
	}

	initRemotePlayer(remotePlayer: AvatarActor) {
		const g = new Microverse.THREE.Group()
		g.position.set(...remotePlayer.translation)
		g.quaternion.set(...remotePlayer.rotation)
		this.shape.add(g)

		const geometry = new Microverse.THREE.PlaneGeometry(0.5, 0.5)
		const img = document.createElement("img")
		img.setAttribute("src", "data:image/png;base64,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")
		const mask = new Microverse.THREE.Texture(img)
		mask.needsUpdate = true
		const material = new Microverse.THREE.MeshBasicMaterial({ alphaMap: mask, transparent: true, color: 0x008000, side: Microverse.THREE.DoubleSide })
		const callButton = new Microverse.THREE.Mesh(geometry, material)
		callButton.position.set(-0.5, -0.3, -0.4)
		callButton.rotation.set(0, Math.PI - 0.3, 0)
		callButton.userData.playerId = remotePlayer._playerId
		g.add(callButton)

		callButton.visible = false

		const dispose = () => {
			g.removeFromParent()
			mask.dispose()
			material.dispose()
		}

		this.subscribe(remotePlayer.id, "translateTo", this.playerMoved)
		this.subscribe(remotePlayer.id, "rotateTo", this.playerMoved)
		this.players.set(remotePlayer._playerId, {
			g,
			callButton,
			id: remotePlayer._playerId,
			dispose,
			joinedAt: this.now(),
		})
	}

	isClose(player: AvatarActor) {
		const a = new Microverse.THREE.Vector3(...this.getMyAvatar().translation)
		const b = new Microverse.THREE.Vector3(...player.translation)
		const dsq = a.distanceToSquared(b)
		return dsq < 64 && dsq > 9
	}

	dropRemotePlayer(remotePlayer: RemotePlayerStuff) {
		remotePlayer.dispose()
		this.players.delete(remotePlayer.id)
	}

	isPlayerInCall(playerId: string) {
		return new Set([...this.actor.calls].flatMap(({ peer1, peer2 }) => [peer1, peer2])).has(playerId)
	}

	playerMoved() {
		const players: Map<string, AvatarActor> = this.actor.service("PlayerManager").players
		this.players.forEach((remotePlayer, id) => {
			const p = players.get(id)
			if (!p) return
			
			remotePlayer.g.position.set(...p.translation)
			remotePlayer.g.quaternion.set(...p.rotation)

			if (this.currentCall) return
			if (this.isPlayerInCall(id)) return

			// TODO: maybe better to wait until they first move
			const secondsSinceJoined = (this.now() - remotePlayer.joinedAt) / 1000
			remotePlayer.callButton.visible = secondsSinceJoined > 10 && this.isClose(p)
		})
	}

	playerEnter(player) {
		if (player._playerId === this.myPlayerId) return
		this.initRemotePlayer(player)
	}

	playerLeave(player) {
		if (player._playerId === this.myPlayerId) return
		this.dropRemotePlayer(this.players.get(player._playerId))
		this.say("endCall", player._playerId)
	}

	tapped({ ray }) {
		if (!this.currentCall) {
			const rc = new Microverse.THREE.Raycaster(
				new Microverse.THREE.Vector3(...ray.origin),
				new Microverse.THREE.Vector3(...ray.direction),
			)
			const intersection = rc.intersectObjects([...this.players.values()].map(({ callButton }) => callButton))
			const targetPlayerId = intersection[0]?.object.userData.playerId
			if (targetPlayerId) {
				this.say("initCall", { peer1: this.myPlayerId, peer2: targetPlayerId })
			}
		} else {
			this.say("endCall", this.myPlayerId)
		}
	}

	async callStarted({ peer1, peer2 }: Call) {
		if (peer1 !== this.myPlayerId && peer2 !== this.myPlayerId) {
			this.players.get(peer1).callButton.visible = false
			this.players.get(peer2).callButton.visible = false
		} else {
			if (this.currentCall) return
			const peerId = peer1 === this.myPlayerId ? peer2 : peer1

			this.players.forEach(({ callButton }) => callButton.visible = false)
			const peerPlayer = this.players.get(peerId)
			peerPlayer.callButton.visible = true
			peerPlayer.callButton.material.color.set(0xff0000)

			const { token } = await this.getToken(peer1, peer2)
			this.space = await window.engage;

			const url = "https://causeverse-6fxnof34.livekit.cloud/";
			const room = this.space.joinRoom(url, token);

			this.currentCall = {
				peerId,
				room,
			}

			// TODO: handle more ways in which establishing a call may fail

			room.on("connected", () => {
				if (!this.currentCall) return
				room.localParticipant.enableCameraAndMicrophone()
					.catch((err) => {
						console.error(err)
						this.say("callFailed", this.myPlayerId)
					})
			})

			room.on("trackPublished", (publication, participant) => {
				if (!this.currentCall) return
				if (publication.kind !== "video") return
				const video = document.createElement("video")
				// const { width, height } = publication.dimensions
				// const aspectRatio = width/height
				const texture = new Microverse.THREE.VideoTexture(video)
				texture.center.set(0.5, 0.5)
				// aspectRatio > 1 ? texture.repeat.set(1/aspectRatio, 1) : texture.repeat.set(1, aspectRatio)
				const geometry = new Microverse.THREE.CircleGeometry(0.8, 64)
				const material = new Microverse.THREE.MeshBasicMaterial({ map: texture, side: Microverse.THREE.DoubleSide })
				const mesh = new Microverse.THREE.Mesh(geometry, material)
				mesh.position.set(0, 1.8, 0)
				mesh.rotation.set(0, Math.PI, 0)
				peerPlayer.g.add(mesh)
				this.currentCall.peerMesh = mesh
				this.currentCall.texture = texture
				publication.on("subscribed", async track => {
					if (!this.currentCall) return
					track.attach(video)
					await video.play()
					this.currentCall.track = track
					this.pollVideoAspectRatio()
				})
				publication.setSubscribed(true)
			})

			room.on("trackUnpublished", () => {
				this.say("endCall", this.myPlayerId)
			})

			room.on("disconnected", () => {
				this.say("endCall", this.myPlayerId)
			})
		}
	}

	callEnded({ peer1, peer2 }: Call) {
		if (this.myPlayerId === peer1 || this.myPlayerId === peer2) {
			if (!this.currentCall) return

			this.currentCall.room.leave()

			// if (this.currentCall.peerMesh)
			// 	this.currentCall.peerMesh.material.map.needsUpdate = true
			this.currentCall.peerMesh?.removeFromParent()
			this.currentCall.texture?.dispose()

			const peerPlayer = this.players.get(this.currentCall.peerId)
			if (peerPlayer) {
				peerPlayer.callButton.material.color.set(0x008800)
				peerPlayer.callButton.visible = this.isClose(this.actor.service("PlayerManager").players.get(peerPlayer.id))
			}
			this.currentCall = null
		} else {
			if (!this.currentCall) {
				const ps = this.actor.service("PlayerManager").players
				this.players.get(peer1).callButton.visible = this.isClose(ps.get(peer1))
				this.players.get(peer2).callButton.visible = this.isClose(ps.get(peer2))
			}
		}
	}

	async getToken(peer1, peer2) {
		const response = await fetch("https://api.8base.com/clidfgh5000ma08mmeduqevky/webhook/engage/token",{
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName: `engage-ptp-video-${peer1}-${peer2}-${this.sessionId}`,
				participantName: this.myPlayerId,
			})
		});
		return response.json();
	}
}



export default {
	modules: [
		{
			name: "EngagePtPVideo",
			actorBehaviors: [EngagePtPVideoActor],
			pawnBehaviors: [EngagePtPVideoPawn],
		},
	]
}
