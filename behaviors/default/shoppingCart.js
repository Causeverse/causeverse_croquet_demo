class ShoppingCartPawn {
  setup() {
    this.addEventListener("pointerTap", "popUp");

    this.subscribe("popupWindow", "addImage", "addImage");
  }

  popUp() {
    // debugger;
    
    

    if (!document.getElementById("shopping_cart")) {
      if (this.popupWindow) {
        delete this.popupWindow;
      }

      this.popupWindow = document.createElement("iframe");
      this.popupWindow.src = "/assets/html/shopping_cart.html";

      this.popupWindow.id = "shopping_cart";
      this.popupWindow.style.position = "absolute";
      this.popupWindow.style.top = "20px";
      this.popupWindow.style.left = "20px";
      this.popupWindow.style.width = "400px";
      this.popupWindow.style.height = "400px";
      this.popupWindow.style.margin = "0px";
      this.popupWindow.style.zIndex = 1000;

      

      document.body.appendChild(this.popupWindow);
      console.log(this.popupWindow.contentWindow);
      this.popupWindow.contentWindow.onload = () => {
        this.popupWindow.contentWindow.postMessage({ message: "select-card", card:this.actor });
        this.popupWindow.contentWindow.postMessage({ message: "moveWindow" });
      }
    } else {
      this.popupWindow = document.getElementById("shopping_cart");
      this.popupWindow.contentWindow.postMessage({ message: "select-card", card:this.actor });
      this.popupWindow.contentWindow.postMessage({ message: "moveWindow" });
    }

    
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
