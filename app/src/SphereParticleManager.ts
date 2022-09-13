import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Color, ColorRepresentation, MeshBasicMaterial } from "three/src/Three";

import { DefColor } from "./ConstantDefine";
import { SentenceManager } from "./SentenceManager";
import SphereParticle from "./SphereParticle";

const AUTO_CREATE_INTERVAL = 7;
const MAX_PARTICLE_NUM = 200;
const VS_COLORS = [
    DefColor.Miku.IMAGE_COLOR,
    DefColor.Rin.IMAGE_COLOR,
    DefColor.Len.IMAGE_COLOR,
    DefColor.Luka.IMAGE_COLOR,
    DefColor.Meiko.IMAGE_COLOR,
    DefColor.Kaito.IMAGE_COLOR,
];

export default class SphereParticleManager {
    private _scene: Scene;
    private _sentenceManager: SentenceManager;
    // 球体の変数
    private _spheres: Mesh[];
    // パーティクルの変数
    private _particles: SphereParticle[];
    private _particleColor: Color;
    // パーティクルを生成する対象のインデックス
    private _targetIndex: number;
    // 発散モードを実行できるか
    private _canSpread: boolean;
    // パーティクル自動生成関連
    private _isAutoCreate: boolean;
    private _nextAutoCreateTime: number;

    public constructor(scene: Scene, sentenceManager: SentenceManager) {
        this._scene = scene;
        this._spheres = [];
        this._particles = [];
        this._targetIndex = 0;
        this._canSpread = true;
        this._sentenceManager = sentenceManager;
        this._isAutoCreate = false;
        this._nextAutoCreateTime = AUTO_CREATE_INTERVAL;
    }

    public dispose(): void {
        this._spheres.forEach((sphere) => {
            sphere.geometry.dispose();
            (sphere.material as MeshBasicMaterial).dispose();
        });
        this._particles.forEach((particle) => {
            this._sentenceManager.removeSentence(particle.id);
        });
    }

    public restart(): void {
        this.removeParticles();
        this._canSpread = true;
    }

    public createSphere(position: Vector3) {
        // ベースになる球体の生成
        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0x2020ff });
        const sphere = new Mesh(geometry, material);
        sphere.position.set(position.x, position.y, position.z);
        this._scene.add(sphere);
        this._spheres.push(sphere);
    }

    public createParticle(position: Vector3, color: ColorRepresentation) {
        // パーティクル数が上限を超える場合は削除する
        if (this._particles.length >= MAX_PARTICLE_NUM) {
            this.deleteOldParticle();
        }

        const sentence = this._sentenceManager.addParticleSentence({
            baseParam: {
                position: position,
                isBloom: true,
            },
            color: color,
        });
        const sphereParticle = new SphereParticle();
        sphereParticle.create({
            position: position.clone(),
            target: this._spheres[this._targetIndex],
            sentence: sentence,
            scene: this._scene,
        });
        this._particles.push(sphereParticle);

        // 所属対象の球体は順番で選ぶ
        this._targetIndex = (1 + this._targetIndex) % this._spheres.length;
    }

    public update(delta) {
        // 全パーティクルの動きを更新
        this._particles.map((particle) => {
            particle.update(delta);
        });

        // パーティクルの自動生成
        if (this._isAutoCreate) {
            this._nextAutoCreateTime -= delta;
            if (this._nextAutoCreateTime < 0) {
                this.createParticle(this.getAutoCreatePosition(), this.getAutoCreateColor());
                // 次の自動生成までの時間をリセット
                this._nextAutoCreateTime = AUTO_CREATE_INTERVAL;
            }
        }
    }

    public spreadParticles() {
        if (this._canSpread) {
            this._particles.map((particle) => {
                particle.setSpreadMode();
            });
            this._canSpread = false;
        }
    }
    public deleteOldParticle() {
        // 最も古いパーティクルを削除する
        this._sentenceManager.removeSentence(this._particles[0].id);
        this._particles.shift();
    }
    public removeParticles() {
        this._particles.map((particle) => {
            this._sentenceManager.removeSentence(particle.id);
        });
        this._particles = [];
    }

    public setParticlesColor(colors: ColorRepresentation[]) {
        // 色が複数指定されている場合は均等になるように色を付ける
        if (colors.length > 0) {
            this._particles.map((particle, i) => {
                const colorsIndex = i % colors.length;
                particle.setColor(colors[colorsIndex]);
            });
        }
    }

    public setParticlesOriginColor() {
        // 生成時の色に戻す
        this._particles.map((particle, i) => {
            particle.setOriginColor();
        });
    }

    public getAutoCreatePosition(): Vector3 {
        // 向かう球体の位置によって自動生成の生成位置を決める(球体が3個の前提)
        switch (this._targetIndex) {
            case 0: {
                return new Vector3(50 * (Math.round(Math.random()) * 2 - 1), 10, 100);
            }
            case 1: {
                return new Vector3(-50, 10, 100);
            }
            case 2: {
                return new Vector3(50, 10, 100);
            }
            default: {
                return new Vector3(50 * (Math.round(Math.random()) * 2 - 1), 10, 100);
            }
        }
    }
    public getAutoCreateColor(): Color {
        // バチャシンカラーからランダムで色を決める
        return VS_COLORS[Math.floor(Math.random() * VS_COLORS.length)];
    }

    public get particleColor(): Color {
        return this._particleColor;
    }

    public set particleColor(color: Color) {
        this._particleColor = new Color(color);
    }

    public set isAutoCreate(isEnable: boolean) {
        this._isAutoCreate = isEnable;
    }
}

