import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Color, ColorRepresentation } from "three/src/Three";

import { MaterialConfig, SphereSentence } from "./SentenceManager";

export interface SphereParticleCreateParam {
    position: Vector3;
    target: Mesh;
    sentence: SphereSentence;
    scene: Scene;
}
export default class SphereParticle {
    // 描画オブジェクト
    private _sentence: SphereSentence;

    // 動作モード。-1:配置場所移動モード、0:公転モード、1:発散モード、99:待機モード
    private _mode: number;

    // 所属する対象の描画オブジェクト
    private _target: Mesh;
    // 生成時のパーティクルのマテリアル設定
    private _originColor: ColorRepresentation;
    // 生成位置から配置場所までの直線距離
    private _distance: number;
    // 生成位置から配置場所までの直線上の現在値
    private _straightLinePos: Vector3;
    // 公転するときの半径
    private _radius: number;
    // 球面座標上での現在位置の角度
    private _phi: number;
    private _theta: number;
    // 回転の方向
    private _phiDirection: number;
    private _thetaDirection: number;
    // 配置場所
    private _arrivePosition: Vector3;
    // 発散の到着場所
    private _spreadPosition: Vector3;

    private static readonly SPHERE_GEOMETRY: SphereGeometry = new SphereGeometry(1, 8, 8);

    public constructor() {
        this._sentence = null;
        this._mode = -1;
        this._target = null;
        this._originColor = new Color();
        this._distance = 0;
        this._straightLinePos = new Vector3();
        this._radius = 10;
        // 回転方向と球面上の初期角度はランダムで決定
        this._phi = Math.random() * 2 * Math.PI;
        this._theta = Math.random() * 2 * Math.PI;
        this._phiDirection = Math.round(Math.random()) * 2 - 1;
        this._thetaDirection = Math.round(Math.random()) * 2 - 1;
        this._arrivePosition = new Vector3();
        this._spreadPosition = new Vector3();
    }

    public create(param: SphereParticleCreateParam) {
        this._target = param.target;
        this._straightLinePos = param.position;
        // 初期角度とターゲットの位置から配置場所と距離を計算
        this._arrivePosition.setFromSphericalCoords(this._radius, this._phi, this._theta).add(this._target.position);
        this._distance = this._straightLinePos.distanceTo(this._arrivePosition);
        // 発散したときの到着場所を計算
        this._spreadPosition.set(Math.round(Math.random() * 150) - 75, 0, Math.round(Math.random() * 150) - 75);
        // パーティクルの生成
        this._sentence = param.sentence;
        this._originColor = this.materialConfig.color;
        this.position.set(param.position.x, param.position.y, param.position.z);
        this.scale.set(0.7, 0.7, 0.7);
    }

    public update(delta: number) {
        switch (this._mode) {
            // 配置場所移動モード
            case -1: {
                // 移動距離
                const moveDistance = delta * 30;
                // 配置場所との直線距離
                const diffDistance = this._straightLinePos.distanceTo(this._arrivePosition);
                if (diffDistance > moveDistance) {
                    // 配置場所に向かってmoveDistance分だけ直線上の位置を進める
                    const frontVector = this._arrivePosition.clone().sub(this._straightLinePos).normalize();
                    this._straightLinePos = this._straightLinePos.add(frontVector.multiplyScalar(moveDistance));
                    // パーティクルの移動が放物線に見えるように直線上の座標にsin(t)を加えた位置を設定する
                    const t = (1 - diffDistance / this._distance) * Math.PI;
                    this.position.set(this._straightLinePos.x, this._straightLinePos.y + Math.sin(t) * 14, this._straightLinePos.z + Math.sin(t) * 10);
                } else {
                    // 配置場所に到着したら公転モードに変更
                    this._mode = 0;
                }
                break;
            }
            // 公転モード
            case 0: {
                // 移動角度の計算
                const movePhi = this._phiDirection * delta * 2;
                const moveTheta = this._thetaDirection * delta * 2;
                this._phi = (this._phi + movePhi) % (2 * Math.PI);
                this._theta = (this._theta + moveTheta) % (2 * Math.PI);
                // 球面座標から直交座標に変換して位置を設定
                this.position.setFromSphericalCoords(this._radius, this._phi, this._theta).add(this._target.position);
                break;
            }
            // 発散モード
            case 1: {
                // 移動距離
                const moveDistance = delta * 15;
                // 発散の到着場所との直線距離
                const diffDistance = this._straightLinePos.distanceTo(this._spreadPosition);
                // 移動角度の計算
                if (diffDistance > moveDistance) {
                    const frontVector = this._spreadPosition.clone().sub(this._straightLinePos).normalize();
                    this._straightLinePos = this._straightLinePos.add(frontVector.multiplyScalar(moveDistance));
                    // パーティクルの移動が放物線に見えるように直線上の座標にsin(t)を加えた位置を設定する
                    const t = (1 - diffDistance / this._distance) * Math.PI;
                    this.position.set(this._straightLinePos.x, this._straightLinePos.y + Math.sin(t) * 30, this._straightLinePos.z + Math.sin(t) * 15);
                } else {
                    // 発散し終わったら非表示
                    this._sentence.setVisible(false);
                    this._mode = 99;
                }
                break;
            }
            // 待機モード
            default: {
                break;
            }
        }
    }

    public setSpreadMode(): void {
        if (this._mode != 1) {
            this._mode = 1;
            this._straightLinePos.copy(this.position);
            this._distance = this._straightLinePos.distanceTo(this._spreadPosition);
        }
    }

    public setColor(color: ColorRepresentation): void {
        // 今の色と違う場合のみ変更
        const materialConfig = this.materialConfig;
        if (materialConfig.color != color) {
            materialConfig.color = color;
            this._sentence.setMaterial([materialConfig]);
        }
    }

    public setOriginColor(): void {
        // 今の色と違う場合のみ変更
        const materialConfig = this.materialConfig;
        if (materialConfig.color != this._originColor) {
            materialConfig.color = this._originColor;
            this._sentence.setMaterial([materialConfig]);
        }
    }

    public get id(): number {
        return this._sentence.getId();
    }

    public get position(): Vector3 {
        return this._sentence.getPosition();
    }

    public get rotation(): THREE.Euler {
        return this._sentence.getMesh().rotation;
    }

    public get scale(): Vector3 {
        return this._sentence.getScale();
    }

    public get materialConfig(): MaterialConfig {
        return this._sentence.getMaterialConfig();
    }
}
