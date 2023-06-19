// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

export function init(Constants) {
  Constants.AvatarNames = ["causeverse"];

  /* Alternatively, you can specify a card spec for an avatar,
       instead of a string for the partical file name, to create your own avatar.
       You can add behaviorModules here. Also, if the system detects a behavior module
       named AvatarEventHandler, that is automatically installed to the avatar.
        {
            type: "3d",
            modelType: "glb",
            name: "rabbit",
            dataLocation: "./assets/avatars/newwhite.zip",
            dataRotation: [0, Math.PI, 0],
            dataScale: [0.3, 0.3, 0.3],
        }
    */

  Constants.UserBehaviorDirectory = "behaviors/default";
  Constants.UserBehaviorModules = ["shoppingCart.js", "csmLights.js", "popup.js", "shifty4.js", "slides.js", "priceCard.js"];

  Constants.DefaultCards = [
    {
      card: {
        name: "world model",
        placeholder: true,
        placeholderSize: [400, 0.1, 400],
        placeholderColor: 0x808080,
        placeholderOffset: [0, 0, 0],
        translation: [1.070636988005182, -1.5, 10.97875263956077],
        rotation: [0, -Math.PI, 0],
        layers: ["pointer", "walk"],
        name: "/MuseumSpaceExtended.glb",
        dataLocation: "./assets/3d/MuseumSpaceExtended.glb",
        dataScale: [1.5, 1.5, 1.5],
        fileName: "/MuseumSpaceExtended.glb",
        modelType: "glb",
        shadow: true,
        singleSided: true,
        type: "3d",
      },
    },
    {
      card: {
        name: "light",
        layers: ["light"],
        type: "lighting",
        behaviorModules: ["Light"],
        dataLocation:
          "3OF2-s4U1ZOJduGATmLEIXo1iTkQHd5ZBknKgL5SvqpQJzs7Pzx1YGApJiMqPGE6PGEsPSA-Oio7YSYgYDpgCCsZLTYjBjwOJB4sDRcrfAg3Ljk2OBoEGBYWfWAmIGEsPSA-Oio7YSImLD0gOSo9PCpgPwB9AAIIISx8YiYneScqKyQaIisNLHkaGT8YKg56JQwQfHstPiNiGQ49e2ArLjsuYCMBPgMiCQt3OQskGhcleSp9HQIIfXseHgo7EAo9CB48FRwpegsCLH4OIwY",
        fileName: "/abandoned_parking_4k.jpg",
        dataType: "jpg",
      },
    },
    {
      card: {
        // updated UI
        translation: [-2.893156621082443, 0.7617183867697175, -40.28980153633935],
        scale: [4.044857213103242, 4.044857213103242, 4.044857213103242],
        rotation: [0, 0.7060613635388776, 0, 0.7081506555229763],
        type: "2d",
        textureType: "image",
        textureLocation: "./assets/images/Image_2.jpg",
        cardURL: "https://croquet.io",
        behaviorModules: ["ShoppingCart"],
        fullBright: true,
        cornerRadius: 0.05,
        depth: 0.05,
        shadow: true,
        price: "25.99",
      },
    },
    {
      card: {
        translation: [-3.223931177916578, 0.7323632464811168, -62.61002038612586],
        scale: [4.081474444355181, 4.081474444355181, 4.081474444355181],
        rotation: [0, -0.7071067811865476, 0, -0.7071067811865475],
        type: "2d",
        textureType: "image",
        textureLocation: "./assets/images/Image_10.jpg",
        behaviorModules: ["ShoppingCart"],
        fullBright: true,
        cornerRadius: 0.05,
        shadow: true,
        price: "42.5",
      },
    },
    {
      card: {
        translation: [0.9722996053665667, 1.0747901595001719, -20.479155246471258],
        scale: [3.1824159137293933, 3.1824159137293933, 3.1824159137293933],
        rotation: [0, 1.0016035377506327, 0.0040876230226333105, 0],
        type: "2d",
        textureType: "image",
        textureLocation: "./assets/images/Image_5.jpg",
        cardURL: "https://croquet.io",
        behaviorModules: ["ShoppingCart"],
        fullBright: true,
        cornerRadius: 0.05,
        depth: 0.05,
        shadow: true,
        price: "10",
      },
    },
    {
      card: {
        translation: [-3.2335253418547576, 0.8296940527559207, -51.64738647038198],
        scale: [4.467167422092182, 4.467167422092182, 4.467167422092182],
        rotation: [0, -0.7121959868394556, 0, 0.71],
        type: "2d",
        textureType: "image",
        textureLocation: "./assets/images/Image_7.jpg",
        // behaviorModules: ["Shifty4PopUp"],
        behaviorModules: ["ShoppingCart"],
        fullBright: true,
        cornerRadius: 0.05,
        depth: 0.05,
        shadow: true,
        price: "18.6",
      },
    },
    {
      card: {
        name: "entrance",
        type: "object",
        // same position and orientation as in openPortal.js
        translation: [21.36508815813059, 0.33434647977965404, -63.20738209364587],
        rotation: [0, -0.9845475061933894, 0, 0.17511769770179675],
        spawn: "default",
      },
    },

    {
      card:{
        translation: [4.633418784852404, 1.5554655647456497, -57.456539293838844],
        scale: [2.753870803984162, 2.753870803984162, 2.753870803984162],
        rotation: [-0.0012263821518347603, 0.7056527846502783, -0.005350085267201436, -0.7085365340543561],
        layers: ["pointer"],
        name: "/placard_1.png_1",
        cornerRadius: 0.02,
        fileName: "/placard_1.png",
        fullBright: true,
        modelType: "img",
        shadow: true,
        singleSided: true,
        textureLocation: "./assets/images/placard_1.png",
        textureType: "image",
        type: "2d",
    
      }
    },

    {
      card:{
        translation: [4.633418784852404, 1.5554655647456497, -40.456539293838844],
        scale: [2.753870803984162, 2.753870803984162, 2.753870803984162],
        rotation: [-0.0012263821518347603, 0.7056527846502783, -0.005350085267201436, -0.7085365340543561],
        layers: ["pointer"],
        name: "/placard_1.png_2",
        cornerRadius: 0.02,
        fileName: "/placard_1.png",
        fullBright: true,
        modelType: "img",
        shadow: true,
        singleSided: true,
        textureLocation: "./assets/images/placard_1.png",
        textureType: "image",
        type: "2d",
    
    
      }
    },
  ];
}
