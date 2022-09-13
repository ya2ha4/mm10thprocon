import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";

import { DefPosition } from "../ConstantDefine";
import ScreenObject from "./ScreenObject";

export interface StateObjectCreateParam {
    scene: Scene;
}

export class StageObject {
    // 床面
    private _floorMesh: Mesh;
    // ステージ床面
    private _stageMesh: Mesh;
    // スクリーン
    private _screenObject: ScreenObject;

    constructor() {
        this._screenObject = new ScreenObject();
    }

    public dispose(): void {
        this._floorMesh.geometry.dispose();
        (this._floorMesh.material as MeshLambertMaterial).dispose();

        this._stageMesh.geometry.dispose();
        (this._stageMesh.material as MeshLambertMaterial).dispose();

        this._screenObject.dispose();
    }

    public restart(): void {
        this._screenObject.restart();
    }

    public create(param: StateObjectCreateParam): void {
        this._floorMesh = new Mesh(
            new BoxGeometry(DefPosition.Stage.FLOOR_WIDTH, 0.1, DefPosition.Stage.FLOOR_DEPTH, 300, 1, 300),
            new MeshLambertMaterial({})
        );
        this._floorMesh.position.set(0.0, 0.0, 0.0);
        param.scene.add(this._floorMesh);

        this._stageMesh = new Mesh(
            new BoxGeometry(DefPosition.Stage.FLOOR_WIDTH, DefPosition.Stage.STAGE_HEIGHT, DefPosition.Stage.STAGE_DEPTH, 300, 1, 300),
            new MeshLambertMaterial({})
        );
        this._stageMesh.position.copy(DefPosition.Stage.STAGE_POS);
        param.scene.add(this._stageMesh);

        const textureMap = new Map<string, string>();
        textureMap.set("ready", "image/ready.png");
        textureMap.set("none", "image/none.png");
        textureMap.set("finished", "image/finished.png");
        textureMap.set("mm2013", "image/mm2013.png");
        textureMap.set("mm2014", "image/mm2014.png");
        textureMap.set("mm2015", "image/mm2015.png");
        textureMap.set("mm2016", "image/mm2016.png");
        textureMap.set("mm2017", "image/mm2017.png");
        textureMap.set("mm2018", "image/mm2018.png");
        textureMap.set("mm2019", "image/mm2019.png");
        textureMap.set("mm2020", "image/mm2020.png");
        textureMap.set("mm2021", "image/mm2021.png");
        textureMap.set("mm10th", "image/mm10th.png");
        this._screenObject.create({
            initTexturePath: "image/loading.png",
            textureMap: textureMap,
            scene: param.scene,
        });
    }

    public get screen(): ScreenObject {
        return this._screenObject;
    }
}
