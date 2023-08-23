class HyperBeamVideoPawn {
    async setup() {
        console.log("hyperbeam setup");

        if (typeof window.top.allowAdmin === "undefined") {
            window.top.allowAdmin = false;
        }



        const BeamableToken = await this.getBeamableToken();
        console.log("BeamableToken = ", BeamableToken);
        let embedURL = await this.getHBSession(BeamableToken);

        console.log("embedURL = ", embedURL)


        this.roomWidth = 1280 / 360;
        this.roomHeight = 2;
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

        const { searchParams } = new URL(window.location);
        const hyperbeam = searchParams.has('hyperbeam'); // show hyperbeam screen
        console.log("hyperbeam:", searchParams, hyperbeam)

        if (!window.Hyperbeam&&hyperbeam) {
            await new Promise(resolve => {
                const script = document.createElement("script")
                script.type = "module";
                script.innerHTML = `import Hyperbeam from "https://unpkg.com/@hyperbeam/web@latest/dist/index.js";window.Hyperbeam=Hyperbeam;`
                script.onload = resolve;
                const tid = setInterval(() => {
                    if (window.Hyperbeam) {
                        clearInterval(tid);
                        setTimeout(resolve, 500);
                    }
                }, 500)
                document.body.appendChild(script)
            })
        }
        //this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !true })
        this.texture = new THREE.Texture()
        this.texture.flipY = false
        this.texture.generateMipmaps = false
        this.mesh = this.createPlaneMesh(this.texture)
        this.shape.add(this.mesh)

        if (hyperbeam) {
            this.hb = await Hyperbeam(this.hbcontainer, embedURL, {
                frameCb: (frame) => {
                    this.texture.image = frame
                    this.texture.needsUpdate = true
                }
            })
        }

        this.setEventListeners();


    }

    setEventListeners() {

        window.addEventListener("pointermove", (e) => { this.handlePointer(e, "mousemove") })
        window.addEventListener("pointerdown", (e) => { this.handlePointer(e, "mousedown") })
        window.addEventListener("pointerup", (e) => { this.handlePointer(e, "mouseup") })

        window.closePoupModal = () => { document.getElementById('hyperbeam_passcode').remove(); }



        function onKeyEvent(e) {
            if (e.which == 27 && document.getElementById('hyperbeam_passcode')) {
                window.closePoupModal();
            }
            if (!window.top.allowAdmin) {
                return false;
            }
            const { activeElement } = document;
            if ((!activeElement ||
                (activeElement.nodeName !== "INPUT" &&
                    activeElement.nodeName !== "TEXTAREA" &&
                    !activeElement.isContentEditable)) &&
                // your custom checks go here, for example
                (e.key === " " || e.key === "Enter")
            ) {
                this.hb.sendEvent({
                    type: e.type,
                    key: e.key,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey,
                });
            }
        }
        window.addEventListener("keydown", onKeyEvent);
        window.addEventListener("keyup", onKeyEvent);

        this.removeEventListener("pointerDoubleDown", "onPointerDoubleDown");
        this.addEventListener("pointerDoubleDown", "nop");

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
        payload.passCode = "blabla";
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

        const width = this.roomWidth;
        const height = this.roomHeight;

        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
        if (this.mesh && this.hb) {
            const intersects = this.getPlaneIntersects()
            if (intersects.length > 0) {
                if (!window.top.allowAdmin) {
                    if (type == "mousedown" && !document.getElementById('hyperbeam_passcode')) {
                        this.askPasscode().then(() => {
                            window.top.allowAdmin = true;
                            console.log("correct admin");
                        }).catch(() => {
                            console.log("not admin");
                        });
                    }
                    return false;
                }
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

    async askPasscode() {
        const div = document.createElement("div")
        div.innerHTML = `
            <div id="hyperbeam_passcode" style="padding: 20px; position: absolute; z-index: 9000; left: 50%;
                        top: 50%; background-color: grey; transform: translate(-50%, -50%);
                        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5); border-radius: 8px; background-color: rgba(0, 0, 0, 0.5);
                        ">
                <button id="btnClosePoupModal" style="width: 10px;float: right;
                height: 10px; border: 0; background: none;" onclick="closePopup()">X</button>

                <form style="flex-direction: row; flex: none;">
                    <span>code:</span>
                    <input autofocus type="password"/>
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
        document.getElementById('btnClosePoupModal').onclick = window.closePoupModal;
        return new Promise((resolve, reject) => {
            form.onsubmit = async (e) => {
                e.preventDefault()
                const code = input.value
                if (await this.sha256(code) === "feec62854fa4d276b9e7ca69d4f4d59c7d99017c7a0e680707f454f44cebdbcf") {
                    span.innerText = "Success! You have become an admin"
                    input.style.display = "none"
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    resolve()
                } else {
                    span.innerText = "Fail! The code is invalid."
                    input.style.display = "none"
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    reject()
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
            name: "HyperBeamVideo",
            pawnBehaviors: [HyperBeamVideoPawn]
        },
    ]
}
