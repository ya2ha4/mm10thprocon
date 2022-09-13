import { AnimationClip, AnimationMixer, Euler, Material, SkinnedMesh, Vector3 } from "three";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";

export interface MmdCharacterCreateParam {
    name: string;
    modelPath: string;
    position: Vector3;
    rotation: Euler;
    vmdFiles: { name: string; file: string }[];
}

export default class MmdCharacter {
    private _loader: MMDLoader;
    private _mesh: SkinnedMesh;
    private _helper: MMDAnimationHelper;
    private _mixer: AnimationMixer;
    private _loaded: boolean;
    private _motions: AnimationClip[];
    // 再生中のモーション名
    private _playMotionNames: string[];

    public constructor() {
        this._loader = null;
        this._helper = null;
        this._mixer = null;
        this._loaded = false;
        this._motions = [];
        this._playMotionNames = [];
    }

    public create(param: MmdCharacterCreateParam, onCreated): void {
        this._loader = new MMDLoader();
        this._helper = new MMDAnimationHelper();
        this._loader.load(
            param.modelPath,
            (mesh) => {
                this._mesh = mesh;
                // アニメーションの読み込み
                for (let i = 0; i < param.vmdFiles.length; i++) {
                    this._loader.loadAnimation(
                        param.vmdFiles[i].file,
                        this.mesh,
                        (motion) => {
                            this._motions[i] = motion as AnimationClip;
                            this._motions[i].name = param.vmdFiles[i].name;
                        },
                        undefined,
                        undefined
                    );
                }
                // this._mixer.stopAllAction();
                this._helper.add(this.mesh, { animation: this._motions, physics: false });
                this._mixer = this._helper.objects.get(this.mesh).mixer;

                this.mesh.position.copy(param.position);
                this.mesh.rotation.copy(param.rotation);
                this.mesh.scale.set(1, 1, 1);

                this._loaded = true;
                onCreated(this);
            },
            undefined,
            (e) => {
                console.error(e);
            }
        );
    }

    public update(delta: number): void {
        if (this._loaded) {
            this._helper.update(delta);
        }
    }

    public play(names: string[]): void {
        // 必要なモーションを再生する
        names.forEach((name) => {
            // 再生中でないなら
            if (!this._playMotionNames.includes(name)) {
                // モーション再生
                const motion = AnimationClip.findByName(this._motions, name);
                this._mixer.clipAction(motion, this.mesh).play();
                this._playMotionNames.push(name);
            }
        });
        // 再生中の不要なモーションを停止する
        this._playMotionNames.forEach((name) => {
            // 再生が不要なら
            if (!names.includes(name)) {
                // モーション停止
                const motion = AnimationClip.findByName(this._motions, name);
                this._mixer.clipAction(motion, this.mesh).stop();
                this._playMotionNames = this._playMotionNames.filter((e) => {
                    return e != name;
                });
            }
        });
    }

    public setDurationByBeat(beatDuration: number, beatNum: number): void {
        this._motions.forEach((motion) => {
            if (motion.name == "clap_1") {
                // 拍手モーションはビートと同じ間隔に設定
                this._mixer.clipAction(motion, this.mesh).setDuration(beatDuration);
            } else {
                // それ以外のモーションは1小節と同じ間隔に設定
                this._mixer.clipAction(motion, this.mesh).setDuration(beatDuration * beatNum);
            }
        });
    }

    public dispose(): void {
        this.mesh.geometry.dispose();
        (this.mesh.material as Material).dispose();
        this._motions.forEach((motion) => {
            this._mixer.uncacheClip(motion);
            this._mixer.uncacheAction(motion, this.mesh);
        });
        this._mixer.uncacheRoot(this.mesh);
    }

    public get mesh(): SkinnedMesh {
        return this._mesh;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}
