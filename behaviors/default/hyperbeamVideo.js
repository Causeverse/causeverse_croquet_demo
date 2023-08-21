class HyperBeamVideoPawn {
    async setup() {
        console.log("hyperbeam setup");

        this.removeEventListener("pointerDoubleDown", "onPointerDoubleDown");
        this.addEventListener("pointerDoubleDown", "nop");

        const BeamableToken = await this.getBeamableToken();
        console.log("BeamableToken = ", BeamableToken);
        let embedURL = await this.getHBSession(BeamableToken);

        console.log("embedURL = ", embedURL)


        // const embedURL = "https://4lb3j4tbz8sbhkj3ncks3vgci.hyperbeam.com/N5ui2Pr0Tr2HVVibCEbnpg?token=gFDUCJi6-UPs31bqiZnO8gQTma_dlbYTIrkipBZNn3k";
        const { THREE } = Microverse;

        const hbcontainerID = "hbcontainer" + Math.round(Math.random() * 1000);

        // this.placeholderMesh = this.createPlaneMesh()
        // this.placeholderMesh.position.set(...this.getScreenPosition(0))
        // this.shape.add(this.placeholderMesh)
        this.pointer = new THREE.Vector2()

        if (!document.getElementById(hbcontainerID)) {
            this.hbcontainer = document.createElement("div")
            this.hbcontainer.id = hbcontainerID;
            this.hbcontainer.style.width = "1280px";
            this.hbcontainer.style.height = "720px";
            this.hbcontainer.style.position = "fixed";
            this.hbcontainer.style.visibility = "hidden";
            document.body.appendChild(this.hbcontainer);
            console.log("document = ", document);
            console.log("hbcontainer = ", this.hbcontainer);
        }

        if (!window.Hyperbeam) {
            await new Promise(resolve => {
                const script = document.createElement("script")
                script.type = "module";
                script.innerHTML = `import Hyperbeam from "https://unpkg.com/@hyperbeam/web@latest/dist/index.js";window.Hyperbeam=Hyperbeam;`
                script.onload = resolve;
                setTimeout(resolve, 3000);
                document.body.appendChild(script)
            })
        }
        //this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !true })
        this.texture = new THREE.Texture()
        this.texture.flipY = false
        this.texture.generateMipmaps = false
        this.mesh = this.createPlaneMesh(this.texture)
        this.shape.add(this.mesh)

        this.hb = await Hyperbeam(this.hbcontainer, embedURL, {
            frameCb: (frame) => {
                this.texture.image = frame
                this.texture.needsUpdate = true
            }
        })

        this.setEventListeners(this._actor._cardData.admin)
    }

    setEventListeners(active) {
        if (active) {
            window.addEventListener("pointermove", (e) => { this.handlePointer(e, "mousemove") })
            window.addEventListener("pointerdown", (e) => { this.handlePointer(e, "mousedown") })
            window.addEventListener("pointerup", (e) => { this.handlePointer(e, "mouseup") })
        } else {
            window.removeEventListener("pointermove", (e) => { this.handlePointer(e, "mousemove") })
            window.removeEventListener("pointerdown", (e) => { this.handlePointer(e, "mousedown") })
            window.removeEventListener("pointerup", (e) => { this.handlePointer(e, "mouseup") })
        }
    }

    async getBeamableToken() {
        let payload = {};
        payload.grant_type = "guest";
        const resp = await fetch("https://api.beamable.com/basic/auth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-BEAM-SCOPE": "guo-youlei.DE_1642198348336146",
            },
            body: JSON.stringify(payload),
        })
        return (await resp.json()).access_token
    }

    async getHBSession(access_token) {
        let payload = {};
        payload.passCode = "asdf";
        const resp = await fetch("https://api.beamable.com/basic/1642198348336143.DE_1642198348336145.micro_HBSessionService/GetSession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-DE-SCOPE": "guo-youlei.DE_1642198348336146",
                "Authorization": "Bearer " + access_token
            }, body: JSON.stringify(payload),
        })
        return (await resp.json()).embed_url
    }

    getScreenPosition(ix) {
        const level = Math.floor(ix / 2)
        const side = ix % 2
        return [side * 4, level * 2.2, 0]
    }

    createPlaneMesh(texture) {
        const geometry = new THREE.PlaneGeometry(2 * 640 / 360, 2)
        const material = texture
            ? new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture })
            : new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "#0b0b0b" })
        const mesh = new THREE.Mesh(geometry, material)
        return mesh
    }

    handlePointer(e, type) {
        const width = 2 * 640 / 360;
        const height = 2;

        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
        if (this.mesh && this.hb) {
            const intersects = this.getPlaneIntersects()
            if (intersects.length > 0) {
                const vector = new THREE.Vector3().copy(intersects[0].point)
                this.mesh.worldToLocal(vector)
                this.hb.sendEvent({
                    type,
                    x: vector.x / width + 0.5,
                    y: vector.y / height + 0.5,
                    button: e.button
                })
            }
        }
    }

    getPlaneIntersects() {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(this.pointer, this.service("ThreeRenderManager").camera)
        if (!this.mesh) {
            return [];
        }
        return raycaster.intersectObject(this.mesh, false)
    }
}

export default {
    modules: [
        {
            name: "HyperBeamVideo",
            pawnBehaviors: [HyperBeamVideoPawn]
        },
    ]
}
