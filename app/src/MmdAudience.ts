import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";

import MeshObject from "./MeshObject";

export interface MmdAudienceCreateParam {
    modelPath: string;
    position: Vector3;
    rotation: Vector3;
    mode: number;
    scene: Scene;
    movingObjects: MeshObject[];
}

export default class MmdAudience {
    private _object: MeshObject;

    private _loaded: boolean;

    public constructor() {
        this._object = null;
        this._loaded = false;
    }

    public create(param: MmdAudienceCreateParam): void {
        const loader = new MMDLoader();
        loader.load(
            param.modelPath,
            (mmd) => {
                this._object = new MeshObject(new Mesh(mmd.geometry, mmd.material));
                this._object.mode = param.mode;
                this._object.position = param.position;
                this._object.rotation = param.rotation;
                this._object.scale = new Vector3(1, 1, 1);

                // Mainへのオブジェクト登録方法は後ほど見直し
                param.scene.add(this._object.mesh);
                param.movingObjects.push(this._object);
            },
            undefined,
            function (e) {
                console.error(e);
            }
        );
    }

    public get object(): MeshObject {
        return this._object;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}
