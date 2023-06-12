class ShoppingCartPawn {
  setup() {
    this.addEventListener("pointerTap", "popUp");
  }

  popUp() {
    // debugger;
    if (document.getElementById("shopping_cart")) {
      document.getElementById("shopping_cart").remove();
      delete this.popupWindow;
    }

    let cardCount = 0;
    let mouseX = 20;
    if (window.top.cardsSelected) cardCount = Object.keys(window.top.cardsSelected).length;
    if (window.top.mousePosition) mouseX = window.top.mousePosition[0];

    this.popupWindow = document.createElement("iframe");
    this.popupWindow.src = "/assets/html/shopping_cart.html";

    this.popupWindow.id = "shopping_cart";
    // this.popupWindow.width = 400;
    // this.popupWindow.height = 400 + cardCount * 150;
    this.popupWindow.style.position = "absolute";
    this.popupWindow.style.top = "20px";
    this.popupWindow.style.left = (Math.min(window.innerWidth - 400,Math.max(20, mouseX - 200))) + "px";
    this.popupWindow.style.width = "400px";
    this.popupWindow.style.height = 235 + 66 * cardCount + "px";
    this.popupWindow.style.margin = "0px";
    this.popupWindow.style.zIndex = 1000;

    console.log("left = ", this.popupWindow.style.left);

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
