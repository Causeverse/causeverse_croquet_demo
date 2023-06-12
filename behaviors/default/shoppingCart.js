class ShoppingCartPawn {
  setup() {
    this.addEventListener("pointerTap", "popUp");
  }

  popUp() {
    // debugger;
    if (!document.getElementById("shopping_cart")) {
      delete this.popupWindow;
    }
    if (this.popupWindow) {
      this.popupWindow.remove();
      delete this.popupWindow;
      return;
    }

    let cardCount = 0;
    if (window.top.cardsSelected) cardCount = Object.keys(window.top.cardsSelected).length;

    this.popupWindow = document.createElement("iframe");
    this.popupWindow.src = "/assets/html/shopping_cart.html";

    this.popupWindow.id = "shopping_cart";
    this.popupWindow.width = 800;
    this.popupWindow.height = 400 + cardCount * 150;
    this.popupWindow.style.position = "absolute";
    this.popupWindow.style.left = "20px";
    this.popupWindow.style.top = "20px";
    this.popupWindow.style.width = "800px";
    this.popupWindow.style.height = Math.max(300 + 100 * cardCount, 800).toString() + "px";

    this.popupWindow.style.zIndex = 1000;

    document.body.appendChild(this.popupWindow);

  }
}

export default {
  modules: [
    {
      name: "ShoppingCart",
      pawnBehaviors: [ShoppingCartPawn],
    },
  ],
};
