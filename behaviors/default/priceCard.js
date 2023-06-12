class PriceCardPawn {
    setup() {
        this.addEventListener("pointerTap", "tapped");
    }

    tapped() {
        if(!window.top.cardsSelected) {
            window.top.cardsSelected = {}
        }
        if(!window.top.cardsSelected[this.actor.id]) {
            window.top.cardsSelected[this.actor.id] = this.actor._cardData;
        } else {
            delete window.top.cardsSelected[this.actor.id]
        }
        
    }
}

export default {
    modules: [
        {
            name: "PriceCard",
            pawnBehaviors: [PriceCardPawn],
        }
    ]
}
