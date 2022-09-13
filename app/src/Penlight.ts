import { CylinderGeometry } from "three/src/geometries/CylinderGeometry";
import { Vector3 } from "three/src/math/Vector3";
import { Group } from "three/src/objects/Group";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Color, ColorRepresentation, MeshBasicMaterial } from "three/src/Three";

import { DefColor } from "./ConstantDefine";
import { CylinderSentence, MaterialConfig, SentenceManager } from "./SentenceManager";
import SphereParticleManager from "./SphereParticleManager";

// アニメーション再生時間
const ANIMATION_TIME = 0.5;

export default class Penlight {
    private _scene: Scene;
    private _sentenceManager: SentenceManager;
    private _sphereParticleManager: SphereParticleManager;

    private _sentence: CylinderSentence;
    private _penlight: Group;
    private _animationTime: number;

    private _handle: Mesh;

    public constructor(scene: Scene, sentenceManager: SentenceManager, sphereParticleManager: SphereParticleManager) {
        this._scene = scene;
        this._sentenceManager = sentenceManager;
        this._sphereParticleManager = sphereParticleManager;
        this._penlight = null;
        this._animationTime = 0;
    }

    public dispose(): void {
        this._sentenceManager.removeSentence(this._sentence.getId());
        this._handle.geometry.dispose();
        (this._handle.material as MeshBasicMaterial).dispose();
    }

    public create(position: Vector3, color: Color) {
        // ペンライトの取っ手部分
        const handleGeometry = new CylinderGeometry(0.55, 0.55, 2, 20);
        const handleMaterial = new MeshBasicMaterial({ color: 0xffffff });
        this._handle = new Mesh(handleGeometry, handleMaterial);
        // ペンライトのライト部分(位置は後でまとめて調整)
        this._sentence = this._sentenceManager.addPenlightSentence({
            baseParam: {
                position: new Vector3(0, 3, 0),
                isBloom: true,
            },
            color: color,
        });

        this._penlight = new Group();
        this._penlight.add(this._sentence.getMesh());
        this._penlight.add(this._handle);
        this._penlight.rotation.set(0.8 * Math.cos(Math.PI / 3), 0, 0.03);
        this._penlight.position.copy(position);
        this._scene.add(this._penlight);
    }

    public update(delta: number) {
        if (this._animationTime > 0) {
            const t = (this._animationTime / ANIMATION_TIME) * Math.PI;
            this._penlight.rotation.set(0.8 * Math.cos(t + Math.PI / 3), 0, 0.03 * Math.cos(t));
            // ここにペンを振る動きを追加
            this._animationTime -= delta;
        }
    }

    public shake(): void {
        // アニメーション中の操作は無視
        // 追記：レスポンスの良さを考慮して連続振りできるよう変更
        if (true || this._animationTime <= 0) {
            // アニメーションのセット
            this._animationTime = ANIMATION_TIME;
            // パーティクルの生成
            this._sphereParticleManager.createParticle(this.getTipPosition(), this.lightColor);
        }
    }

    public setLightColor(color: Color): void {
        const materialConfig = this.materialConfig;
        materialConfig.color = color;
        this._sentence.setMaterial([materialConfig]);
    }

    public getTipPosition() {
        let tipPosition = this._penlight.position.clone();
        tipPosition.add(new Vector3(0, 6, 0));
        return tipPosition;
    }

    public get lightColor(): ColorRepresentation {
        return this._sentence.getMaterialConfig().color;
    }

    public get materialConfig(): MaterialConfig {
        return this._sentence.getMaterialConfig();
    }
}

