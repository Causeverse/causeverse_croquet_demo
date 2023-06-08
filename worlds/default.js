// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

export function init(Constants) {
    Constants.AvatarNames = ["newwhite"];

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
    Constants.UserBehaviorModules = [
        "csmLights.js", "popup.js", "slides.js"
    ];

    Constants.DefaultCards = [
        {
            card: {
                name:"world model",
                
                
                placeholder: true,
                placeholderSize: [400, 0.1, 400],
                placeholderColor: 0x808080,
                placeholderOffset: [0, 0, 0],

                translation: [1.070636988005182, -1.5, 10.97875263956077],
                rotation: [0, -0.9896281675437113, 0, 0.14365267141294777],
                layers: ["pointer", "walk"],
                name: "/MuseumSpaceExtended.glb",
                dataLocation: "./assets/3d/MuseumSpaceExtended.glb",
                dataScale: [1.5, 1.5, 1.5],
                fileName: "/MuseumSpaceExtended.glb",
                modelType: "glb",
                shadow: true,
                singleSided: true,
                type: "3d",
            
            }
        },
        {
            card: {
                name: "light",
                layers: ["light"],
                type: "lighting",
                behaviorModules: ["Light"],
                dataLocation: "3OF2-s4U1ZOJduGATmLEIXo1iTkQHd5ZBknKgL5SvqpQJzs7Pzx1YGApJiMqPGE6PGEsPSA-Oio7YSYgYDpgCCsZLTYjBjwOJB4sDRcrfAg3Ljk2OBoEGBYWfWAmIGEsPSA-Oio7YSImLD0gOSo9PCpgPwB9AAIIISx8YiYneScqKyQaIisNLHkaGT8YKg56JQwQfHstPiNiGQ49e2ArLjsuYCMBPgMiCQt3OQskGhcleSp9HQIIfXseHgo7EAo9CB48FRwpegsCLH4OIwY",
                fileName: "/abandoned_parking_4k.jpg",
                dataType: "jpg",
            }
        },
        {
            card: {
                translation: [-2, 1, -4],
                scale: [8, 8, 8],
                type: "2d",
                textureType: "image",
                textureLocation: "./assets/images/Image_1.jpg",
                behaviorModules: ["PopUpButton"],
                fullBright: true,
                cornerRadius: 0.05,
                depth: 0.05,
                shadow: true,
            }
        },
        {
            card: {
                name: "image card",
                translation: [-12, -0.4, -10.2],
                scale: [8, 8, 8],
                type: "2d",
                textureType: "image",
                textureLocation: "./assets/images/Image_3.png",
                cardURL: "https://croquet.io",
                cardHilite: 0xffffaa,
                behaviorModules: ["URLLink"],
                fullBright: true,
                frameColor: 0xcccccc,
                color: 0xbbbbbb,
                cornerRadius: 0.05,
                depth: 0.05,
                height: 2.4,
                width: 1.8,
                shadow: true,
            }
        },
        {
            card: {
                name: "image card",
                translation: [12, 0.6, 10.77],
                rotation: [0, -Math.PI / 2, 0],
                scale: [4, 4, 4],
                type: "2d",
                textureType: "image",
                textureLocation: "./assets/images/Image_3.png",
                cardURL: "https://croquet.io",
                cardHilite: 0xffffaa,
                behaviorModules: ["URLLink"],
                fullBright: true,
                frameColor: 0xcccccc,
                color: 0xbbbbbb,
                cornerRadius: 0.05,
                depth: 0.05,
                shadow: true,
            }
        },
        {
            card: {
                name: "entrance",
                type: "object",
                // same position and orientation as in openPortal.js
                translation: [21.36508815813059, 0.33434647977965404, -63.20738209364587],
                rotation: [0, -0.9845475061933894, 0, 0.17511769770179675],
                spawn: "default",
            }
        },
    ];
}
