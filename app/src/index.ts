import { GUI } from "dat.gui";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { Clock } from "three/src/core/Clock";
import { Object3D } from "three/src/core/Object3D";
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { PointLight } from "three/src/lights/PointLight";
import { SpotLight } from "three/src/lights/SpotLight";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { Vector2 } from "three/src/math/Vector2";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { Scene } from "three/src/scenes/Scene";
import { Color, Euler } from "three/src/Three";

import { DefColor, DefDevelop, DefPosition } from "./ConstantDefine";
import DebugInfo from "./DebugInfo";
import MyRenderer from "./graphics/MyRenderer";
import MeshObject from "./MeshObject";
import MmdAudience from "./MmdAudience";
import { MmdCharacterCreateParam } from "./MmdCharacter";
import MmdCharacterManager from "./MmdCharacterManager";
import { BaseLyricFactory, LoadingMemoriesLyricFactory, LyricCreatedChecker, LyricFactory, RandomLyricFactory } from "./object/Lyric/LyricFactory";
import LyricObjectManager from "./object/Lyric/LyricObjectManager";
import { StageObject } from "./object/StageObject";
import Penlight from "./Penlight";
import { SentenceManager } from "./SentenceManager";
import SphereParticleManager from "./SphereParticleManager";
import { findMusicInfo } from "./textalive/MusicInfo";
import TextAlivePlayer from "./textalive/TextAlivePlayer";
import DirectingManager from "./DirectingManager";
import { ColorRepresentation } from "three";

const gTargetAspect: number = 16 / 9;
class Main {
    private _mainSequence: MainSequence;

    public constructor() {
        this._mainSequence = new MainSequence();
    }

    public initialize(): void {
        this._mainSequence.initialize();
    }
}

type MainSequenceState = "new" | "initializing" | "ready" | "playing" | "finished" | "delete";

class MainSequence {
    private _player: TextAlivePlayer;
    private static musicInfoIndex = 0;

    private _status: MainSequenceState;

    // 描画関連
    private _renderer: WebGLRenderer;
    private _camera: PerspectiveCamera;
    private _scene: Scene;
    private _myRenderer: MyRenderer;

    private _width: number;
    private _height: number;

    // オブジェクト管理、生成
    private _sentenceManager: SentenceManager;
    private _lyricCreateChecker: LyricCreatedChecker;
    private _lyricFactoryArray: Array<BaseLyricFactory>;
    private _directingManager: DirectingManager;

    // シーンオブジェクト
    // 歌詞
    private _lyricObjectManager: LyricObjectManager;

    // ライト
    private _pointLights: PointLight[];
    // ライト：キャラスポットライト
    private _spotLights: SpotLight[];
    private _spotLightTargetObjects: Object3D[];

    // インタラクション：パーティクル
    private _sphereParticleManager: SphereParticleManager;
    // インタラクション：ペンライト
    private _penlight: Penlight;

    // ステージ
    private _stageObject: StageObject;

    // キャラ
    private _mmdCharacterManager: MmdCharacterManager;
    private _movingObjects: MeshObject[];

    // 経過時間
    private _clock: Clock;

    // デバッグ情報
    private _debugInfo: DebugInfo;

    public constructor() {
        this._player = new TextAlivePlayer();
        this._status = "new";

        // 描画関連 --------------------------------
        this._renderer = new WebGLRenderer();
        this._camera = new PerspectiveCamera(60, gTargetAspect, 1, 1000);
        this._scene = new Scene();
        this._myRenderer = new MyRenderer();

        this._width = window.innerWidth;
        this._height = window.innerHeight;

        // オブジェクト生成管理 --------------------------------
        this._sentenceManager = new SentenceManager();
        this._lyricCreateChecker = new LyricCreatedChecker();
        this._lyricFactoryArray = new Array<BaseLyricFactory>();
        this._directingManager = new DirectingManager();

        // シーンオブジェクト --------------------------------
        // 歌詞 --------------------------------
        this._lyricObjectManager = new LyricObjectManager();

        // ライト --------------------------------
        this._pointLights = new Array<PointLight>();

        const lightNum = 4;
        this._spotLights = new Array(lightNum);
        this._spotLightTargetObjects = new Array(lightNum);

        // インタラクション --------------------------------
        this._sphereParticleManager = new SphereParticleManager(this._scene, this._sentenceManager);
        this._penlight = new Penlight(this._scene, this._sentenceManager, this._sphereParticleManager);

        // ステージ --------------------------------
        this._stageObject = new StageObject();

        // キャラ --------------------------------
        this._mmdCharacterManager = new MmdCharacterManager(this._scene, this._player);
        this._movingObjects = new Array();

        // --------------------------------
        this._clock = new Clock();

        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this._debugInfo = new DebugInfo();
        }

        window.addEventListener("resize", () => this.resize());
    }

    // 非サポート
    // 初めからやり直す際、全リソース初期化は時間かかるので restart() で対応する方針に
    public destructor(): void {
        // todo:
        this._player.dispose();

        this._lyricObjectManager.dispose();

        this._pointLights.forEach((light) => {
            light.dispose();
        });
        this._spotLights.forEach((light) => {
            light.dispose();
        });

        this._sphereParticleManager.dispose();
        this._penlight.dispose();

        this._stageObject.dispose();
        this._mmdCharacterManager.dispose();

        this._status = "delete";
    }

    public restart(): void {
        this._player.restart();

        this._lyricCreateChecker.restart();

        this._lyricObjectManager.restart();
        this._directingManager.restart();
        this._sphereParticleManager.restart();

        this._stageObject.restart();

        this._stageObject.screen.switchTexture("ready");
        this._status = "ready";
    }

    public initialize(): void {
        this._player.initialize(findMusicInfo(MainSequence.musicInfoIndex));

        // 描画関連 --------------------------------
        this._renderer.setSize(this._width, this._height);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._myRenderer.initialize(this._renderer, this._width, this._height, this._scene, this._camera);
        // #canvas-containerにレンダラーのcanvasを追加
        const container = document.getElementById("canvas-container")!;
        container.appendChild(this._renderer.domElement);
        container.addEventListener("click", (event) => this.click(event));
        this._myRenderer.setDebugEvent(container);

        const isFpp = true;
        const fppCameraPos = new Vector3(0.0, 10.0, 100.0);
        if (isFpp) {
            // 一人称視点
            this._camera.position.copy(fppCameraPos);
            // カメラの向き
            this._camera.rotation.set(0.0, Math.PI, 0.0);
            // カメラの注視先を 座標で指定する場合に使用
            // カメラ位置から注視する方向に対して、roll方向の向きを決める必要があるため、
            // lookatを使う場合でも、rotationは使用する必要があると思われる。
            this._camera.lookAt(new Vector3(0.0, DefPosition.Stage.SCREEN_POS.y / 2.0, 0.0));
        } else {
            // 俯瞰視点
            // カメラ位置
            let offset = 2.5;
            // 上からの俯瞰視点
            // this._camera.position.set(-20 * offset, 30 * offset, 40 * offset);
            this._camera.position.set(-200, DefPosition.Stage.SCREEN_POS.y, DefPosition.Stage.STAGE_POS.z);
            this._camera.lookAt(new Vector3(1, DefPosition.Stage.SCREEN_POS.y, -2));
        }

        // オブジェクト生成管理 --------------------------------
        this._sentenceManager.initialize(this._scene);

        if (MainSequence.musicInfoIndex == 0) {
            // 固有演出追加用
            this._lyricFactoryArray.push(new LoadingMemoriesLyricFactory());
            this._lyricFactoryArray.push(new LyricFactory());
        } else {
            this._lyricFactoryArray.push(new RandomLyricFactory());
        }
        this._lyricFactoryArray.forEach((factory) => {
            factory.create({
                lyricObjectManager: this._lyricObjectManager,
                sentenceManager: this._sentenceManager,
                player: this._player,
                createdChecker: this._lyricCreateChecker,
            });
        });

        this._directingManager.create({
            player: this._player,
            myRenderer: this._myRenderer,
            screen: this._stageObject.screen,
            particleManager: this._sphereParticleManager,
            characterManager: this._mmdCharacterManager,
            musicInfoIndex: MainSequence.musicInfoIndex,
        });

        // シーンオブジェクト --------------------------------
        // ポイントライト
        interface PointLightCreateParam {
            color?: ColorRepresentation;
            intensity?: number;
            distance?: number;
            decay?: number;
            position: Vector3;
        }

        const pointLightParams: PointLightCreateParam[] = [
            {
                color: 0x888888,
                position: new Vector3(0, 100, 100),
            },
        ];
        pointLightParams.forEach((param) => {
            const pointLight = new PointLight(param.color, param.intensity, param.distance, param.decay);
            pointLight.position.set(param.position.x, param.position.y, param.position.z);
            this._pointLights.push(pointLight);
            this._scene.add(pointLight);
        });

        // 歌詞 --------------------------------

        // ライト --------------------------------
        for (let i = 0; i < this._spotLights.length; i++) {
            this._spotLights[i] = new SpotLight(0xffffff, 0.5, 1000, Math.PI / 30);
            this._spotLightTargetObjects[i] = new Object3D();
            this._spotLightTargetObjects[i].position.set(i * 20 - 30, 0, 0);
            this._scene.add(this._spotLightTargetObjects[i]);
            // 斜めからターゲットに光を当てる
            this._spotLights[i].position.set(i * 20 - 30, 100, 20);
            this._spotLights[i].target = this._spotLightTargetObjects[i];
            this._scene.add(this._spotLights[i]);
        }

        // インタラクション --------------------------------
        {
            const sphereY = DefPosition.Stage.SCREEN_POS.y + DefPosition.Stage.SCREEN_HEIGHT / 2.0;
            const sphereZ = DefPosition.Stage.SCREEN_POS.z - 30;
            // ベースになる球体を3つ生成しておく
            this._sphereParticleManager.createSphere(new Vector3(0, sphereY * 1.5, sphereZ));
            this._sphereParticleManager.createSphere(new Vector3(-(DefPosition.Stage.SCREEN_WIDTH / 2) * 1.8, sphereY, sphereZ));
            this._sphereParticleManager.createSphere(new Vector3((DefPosition.Stage.SCREEN_WIDTH / 2) * 1.8, sphereY, sphereZ));

            if (!isFpp) {
                this._sphereParticleManager.createSphere(fppCameraPos); // 配置確認用
            }
        }
        this._penlight.create(new Vector3(10, 6, 40), DefColor.Miku.IMAGE_COLOR);

        // ステージ --------------------------------
        this._stageObject.create({ scene: this._scene });

        // キャラ --------------------------------
        const vmdFiles = [
            { name: "shake_rightarm_2", file: "./model/animations/shake_rightarm_2.vmd" },
            { name: "shake_rightarm", file: "./model/animations/shake_rightarm_2.vmd" },
            { name: "shake_upperbody_x", file: "./model/animations/shake_upperbody_x.vmd" },
            { name: "shake_upperbody_z", file: "./model/animations/shake_upperbody_z.vmd" },
            { name: "shake_upperbody_z2", file: "./model/animations/shake_upperbody_z2.vmd" },
            { name: "sing_1", file: "./model/animations/sing_1.vmd" },
            { name: "clap_1", file: "./model/animations/clap_1.vmd" },
        ];
        const charaCreateParams: MmdCharacterCreateParam[] = [
            {
                name: "Miku",
                modelPath: "./model/box_miku_1.1/box_miku_L.pmd",
                position: new Vector3(-10, DefPosition.Stage.STAGE_HEIGHT, DefPosition.Stage.STAGE_POS.z),
                rotation: new Euler(0, 0, 0),
                vmdFiles: vmdFiles,
            },
            {
                name: "Rin",
                modelPath: "./model/box_rin_1.2/box_rin_L.pmd",
                position: new Vector3(10, DefPosition.Stage.STAGE_HEIGHT, DefPosition.Stage.STAGE_POS.z),
                rotation: new Euler(0, 0, 0),
                vmdFiles: vmdFiles,
            },
            {
                name: "Len",
                modelPath: "./model/box_len_1.2/box_len_L.pmd",
                position: new Vector3(30, DefPosition.Stage.STAGE_HEIGHT, DefPosition.Stage.STAGE_POS.z),
                rotation: new Euler(0, 0, 0),
                vmdFiles: vmdFiles,
            },
            {
                name: "Luka",
                modelPath: "./model/box_luka_1.1/box_luka_L.pmd",
                position: new Vector3(-30, DefPosition.Stage.STAGE_HEIGHT, DefPosition.Stage.STAGE_POS.z),
                rotation: new Euler(0, 0, 0),
                vmdFiles: vmdFiles,
            },
        ];
        this._mmdCharacterManager.createCharacters(charaCreateParams);

        // 観客（ブラッシュアップ余裕なければ削除も検討）
        this.initializeAudience(isFpp);

        // GUIの設定 --------------------------------
        const guiControls = {
            penlight: "初音ミク",
            MikuMotion: "停止",
            RinMotion: "停止",
            LenMotion: "停止",
            LukaMotion: "停止",
        };
        const gui = new GUI({ autoPlace: false });
        // ペンライトの色選択
        const colorObject = {
            初音ミク: DefColor.Miku.IMAGE_COLOR,
            鏡音リン: DefColor.Rin.IMAGE_COLOR,
            鏡音レン: DefColor.Len.IMAGE_COLOR,
            巡音ルカ: DefColor.Luka.IMAGE_COLOR,
            MEIKO: DefColor.Meiko.IMAGE_COLOR,
            KAITO: DefColor.Kaito.IMAGE_COLOR,
        };
        gui.add(guiControls, "penlight", Object.keys(colorObject))
            .listen()
            .onChange((key) => {
                // Colorオブジェクトをそのまま渡せないので、キーで色を引っ張る
                this._penlight.setLightColor(colorObject[key]);
            });
        // (test)キャラクターモーションの選択
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            const motionObject = {
                停止: [],
                右手を振る: ["shake_rightarm_2"],
                右手を振る2: ["shake_rightarm"],
                体を前後に振る: ["shake_upperbody_x"],
                体を左右に振る: ["shake_upperbody_z"],
                体を左右に振る2: ["shake_upperbody_z2"],
                歌う: ["sing_1"],
                体を揺らして手を振る: ["shake_upperbody_z2", "shake_rightarm"],
                拍手: ["clap_1"],
            };
            gui.add(guiControls, "MikuMotion", Object.keys(motionObject))
                .listen()
                .onChange((key) => {
                    if (this._mmdCharacterManager.isLoaded) {
                        this._mmdCharacterManager.getCharacter("Miku").play(motionObject[key]);
                    }
                });
            gui.add(guiControls, "RinMotion", Object.keys(motionObject))
                .listen()
                .onChange((key) => {
                    if (this._mmdCharacterManager.isLoaded) {
                        this._mmdCharacterManager.getCharacter("Rin").play(motionObject[key]);
                    }
                });
            gui.add(guiControls, "LenMotion", Object.keys(motionObject))
                .listen()
                .onChange((key) => {
                    if (this._mmdCharacterManager.isLoaded) {
                        this._mmdCharacterManager.getCharacter("Len").play(motionObject[key]);
                    }
                });
            gui.add(guiControls, "LukaMotion", Object.keys(motionObject))
                .listen()
                .onChange((key) => {
                    if (this._mmdCharacterManager.isLoaded) {
                        this._mmdCharacterManager.getCharacter("Luka").play(motionObject[key]);
                    }
                });
        }
        const guiContainer = document.getElementById("gui-container")!;
        guiContainer.appendChild(gui.domElement);

        // --------------------------------
        this._status = "initializing";

        this.resize();

        this.update();
    }

    private isInitialized(): boolean {
        if (!this._player.isInitialized()) {
            return false;
        }

        if (!this._sentenceManager.isLoaded()) {
            return false;
        }

        if (!this._mmdCharacterManager.isLoaded()) {
            return false;
        }

        if (!this._stageObject.screen.isLoaded()) {
            return false;
        }

        return true;
    }

    private isFinished(): boolean {
        return this._lyricObjectManager.isFinished() && this._player.isFinished();
    }

    public update(): void {
        requestAnimationFrame(() => {
            this.update();
        });
        this._myRenderer.dispLoading(false);
        if (this._status == "new" || this._status == "initializing") {
            this._myRenderer.dispLoading(true);
        }

        if (this._status == "initializing" && this.isInitialized()) {
            this._stageObject.screen.switchTexture("ready");
            this._status = "ready";
        }

        if (this._status == "playing" && this.isFinished()) {
            this._stageObject.screen.switchTexture("finished");
            this._sphereParticleManager.isAutoCreate = false;
            this._status = "finished";
            this._mmdCharacterManager.nameList.forEach((name) => {
                this._mmdCharacterManager.getCharacter(name).play([]);
            });
        }

        const delta = this._clock.getDelta();

        // 描画関連 --------------------------------

        // オブジェクト生成管理 --------------------------------
        this._lyricFactoryArray.forEach((factory) => {
            factory.update();
        });
        this._directingManager.update();

        // シーンオブジェクト --------------------------------
        // 歌詞 --------------------------------
        this._lyricObjectManager.update(delta);

        // ライト --------------------------------
        const sec = performance.now() / 1000;
        const lightR = [5, 1, 1, 5];
        for (let i = 0; i < this._spotLightTargetObjects.length; i++) {
            const r = i < lightR.length ? lightR[i] : 0;
            this._spotLightTargetObjects[i].position.set(r * Math.sin(sec * 2 + i) + i * 20 - 30, 3, 1 * Math.cos(sec * 2 + i) + DefPosition.Stage.STAGE_POS.z);
        }

        // インタラクション --------------------------------
        this._sphereParticleManager.update(delta);
        this._penlight.update(delta);

        // ステージ --------------------------------

        // キャラ --------------------------------
        this._mmdCharacterManager.update(delta);

        // --------------------------------
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this._debugInfo.update();
        }

        this._myRenderer.render(delta);
    }

    private resize(): void {
        let currentAspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
        if (currentAspect > gTargetAspect) {
            this._height = document.documentElement.clientHeight;
            this._width = gTargetAspect * this._height;
        } else {
            this._width = document.documentElement.clientWidth;
            this._height = this._width / gTargetAspect;
        }
        if (this._renderer) {
            this._renderer.setSize(this._width, this._height);
        }
        if (this._myRenderer) {
            this._myRenderer.resize(this._width, this._height);
        }
    }

    private click(event: MouseEvent): void {
        // クリック対象がcanvasオブジェクトの場合
        if (event.target == this._renderer.domElement) {
            // ペンライトを振ってパーティクルを生成
            this._penlight.shake();
        }

        if (this._status == "ready") {
            if (this._player.requestPlay()) {
                this._stageObject.screen.switchTexture("none");
                this._sphereParticleManager.isAutoCreate = true;
                this._status = "playing";
                this._mmdCharacterManager.nameList.forEach((name) => {
                    this._player;
                    const singerName = findMusicInfo(MainSequence.musicInfoIndex).singerName;
                    const playMotion = singerName.includes(name) ? ["sing_1"] : ["shake_rightarm_2"];
                    this._mmdCharacterManager.getCharacter(name).play(playMotion);
                });
            } else {
                console.warn(`player.requestPlay() に失敗`);
            }
        }

        if (this._status == "finished") {
            this.restart();
            this._stageObject.screen.switchTexture("ready");
            this._status = "ready";
        }

        if (this._camera == null || this._scene == null) {
            return;
        }

        const element = <HTMLDivElement>event.currentTarget;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;

        // 座標を [-1.0, 1.0] に正規化
        const pos = new Vector2((x / w - 0.5) * 2.0, -(y / h - 0.5) * 2.0);
        // console.log(`click normalized pos: (${pos.x}, ${pos.y})`);
        this._myRenderer.setTouchPos(event);
    }

    // ブラッシュアップの余裕があれば整備
    private initializeAudience(isFpp: boolean): void {
        if (!isFpp) {
            const audience_col = 6;
            const audience_row = 4;
            const audience_num = audience_col * audience_row;
            for (let i = 0; i < audience_num; i++) {
                const col = i / audience_row;
                const row = i % audience_row;
                const audience = new MmdAudience();
                audience.create({
                    modelPath: "./model/uchu_miku/uchu_miku.pmd",
                    position: new Vector3(-((audience_col / 2) * 15) + col * 15, 0, row * 10),
                    rotation: new Vector3(0, 0, 0),
                    mode: i % 12 == 9 ? 41 : 40,
                    scene: this._scene,
                    movingObjects: this._movingObjects,
                });
            }
        }

        if (!isFpp) {
            // オブジェクトの底が、x,z軸0より上にあるモデルに差し替える
            const boxWidth = 1;
            const boxHeight = 10;
            const boxDepth = 1;
            const geometry = new BoxGeometry(boxWidth, boxHeight, boxDepth, 1, 1, 1);
            const loader = new TextureLoader();
            const material = new MeshLambertMaterial({});
            let stage = new Mesh(geometry, material);
            stage.position.set(0, 1.5, -35);
            this._scene.add(stage);

            const psyllium_num = 24 * 12;
            for (let i = 0; i < psyllium_num; i++) {
                let mesh = new Mesh(geometry, material);
                let psyllium = new MeshObject(mesh);
                // 横
                const col = i / 13;
                // 縦
                const row = i % 13;

                if (i % 9 == 6) {
                    psyllium.mode = 51;
                } else {
                    psyllium.mode = 50;
                }

                psyllium.position = new Vector3(-80 + col * 10, 10, row * 10);
                psyllium.rotation = new Vector3(0, 0, 0);
                psyllium.scale = new Vector3(0.7, 0.7, 0.7);
                this._scene.add(mesh);
                this._movingObjects.push(psyllium);
            }
        }
    }
}

const main = new Main();
main.initialize();

