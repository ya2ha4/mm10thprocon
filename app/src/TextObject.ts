import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";

import MeshObject from "./MeshObject";

export interface TextObjectCreateParam {
    text: string; // todo textalive-app-api の iPhase を受け取って表示できるようにする
    fontPath: string;
    position: Vector3;

    scene: Scene;
    //movingObjects: MeshObject[];
}

export default class TextObject {
    private _object: MeshObject;

    private _loaded: boolean;

    public constructor() {
        this._loaded = false;
    }

    public create(param: TextObjectCreateParam): void {
        const fontLoader = new FontLoader();
        fontLoader.load(param.fontPath, (font) => {
            const textGeometry = new TextGeometry(param.text, {
                font: font,
                size: 10,
                height: 1,
            });

            const mt = new MeshBasicMaterial({
                color: 0xffff00,
            });

            const mesh = new Mesh(textGeometry, mt);
            mesh.layers.toggle(1);
            mesh.position.copy(param.position);

            param.scene.add(mesh);
            //param.movingObjects.push();
        });
    }

    public get object(): MeshObject {
        return this._object;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}
