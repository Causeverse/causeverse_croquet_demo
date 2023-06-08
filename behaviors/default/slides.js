class SlidesActor {
    setup() {
        this.addEventListener("pointerDown", "advance");
    }

    advance() {
        let index = this._cardData.slideIndex || 0;
        let slides = this._cardData.slides;

        index++;
        if (index >= slides.length) {
            index = 0;
        }
        this._cardData.slideIndex = index;

        this.say("show");
    }
}

class SlidesPawn {
    setup() {
        this.clear();
        this.show();
        this.listen("show", "show");
        this.listen("updateShape", "show");
    }

    show() {
        const THREE = Microverse.THREE;

        if (!this.mesh) {
            let geometry = new THREE.BoxGeometry(1, 1, 1);
            let material = new THREE.MeshStandardMaterial();
            this.mesh = new THREE.Mesh(geometry, material);
            this.shape.add(this.mesh);
        }

        let index = this.actor._cardData.slideIndex || 0;
        let dataId = this.actor._cardData.slides[index];
        if (!dataId) {return;}

        this.getBuffer(dataId).then((buffer) => {
            let objectURL = URL.createObjectURL(new Blob([buffer]));
            this.objectURL = objectURL;
            return new Promise((resolve, reject) => {
                this.texture = new THREE.TextureLoader().load(
                    objectURL,
                    (texture) => {
                        resolve(texture)
                        // texture.wrapS = THREE.RepeatWrapping;
                        // texture.wrapT = THREE.RepeatWrapping;
                    }, null, reject);
            });
        }).then((textureData) => {
            let oldMaterial = this.mesh?.material;
            let material = new THREE.MeshStandardMaterial({map: textureData});
            this.mesh.material = material;
            if (oldMaterial) {
                oldMaterial.dispose();
            }
        });
    }

    clear() {
        ["mesh", "material", "texture", "geometry"].forEach((n) => {
            if (this[n]) {
                this[n].dispose();
                delete this[n];
            }
        });
    }
}

export default {
    modules: [
        {
            name: "Slides",
            actorBehaviors: [SlidesActor],
            pawnBehaviors: [SlidesPawn],
        }
    ]
}

/* globals Microverse */
