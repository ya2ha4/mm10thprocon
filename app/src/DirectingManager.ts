import TextAlivePlayer from "./textalive/TextAlivePlayer";
import ScreenObject from "./object/ScreenObject";
import SphereParticleManager from "./SphereParticleManager";
import { ColorRepresentation, MathUtils } from "three";
import { DefColor, DefPhraseIndex } from "./ConstantDefine";
import MmdCharacterManager from "./MmdCharacterManager";
import MyRenderer from "./graphics/MyRenderer";
import { IPhrase } from "textalive-app-api";

export interface DirectingManagerCreateParam {
    player: TextAlivePlayer;
    myRenderer: MyRenderer;
    screen: ScreenObject;
    particleManager: SphereParticleManager;
    characterManager: MmdCharacterManager;
    musicInfoIndex: number;
}

interface DerectiongDuration {
    startPhraseIndex: number;
    endPhraseIndex: number;
}

interface FillterAnimationStartKeyFrame {
    phraseIndex: number; // 演出開始タイミングのフレーズIndex
    value: number; // 演出開始時の値
}

interface FillterAnimationDuration {
    time: number; // 演出のアニメーション時間[ms]
    value: number; // 演出終了時の値
}

interface FillterAnimationWorkingParam {
    startTime: number; // 演出開始タイミング（パラメータ生成時に取得できない作りにしてしまっているので、開始タイミングでここで保持するよう妥協
    isFinished: boolean; // 演出終了状態か
}

// 開始、終了IPlayer.video 準備前に演出用パラメータ生成する都合、実装が複雑になっている
// 技術的負債になるので作り直しした方が良い
interface IFillterDirectingParam {
    // 開始時はフレーズのindex, 終了タイミングは秒で指定する仕様だからstart, durationで統一感のない複雑なデータ構造になっている
    start: FillterAnimationStartKeyFrame;
    duration: FillterAnimationDuration;
    fillterType: number;
}

class FillterDirectingParam implements IFillterDirectingParam {
    start: FillterAnimationStartKeyFrame;
    duration: FillterAnimationDuration;
    fillterType: number;

    working: FillterAnimationWorkingParam;

    public constructor(param: IFillterDirectingParam) {
        this.start = param.start;
        this.duration = param.duration;
        this.fillterType = param.fillterType;

        this.working = { startTime: Number.MIN_SAFE_INTEGER, isFinished: false };
    }
}

interface IFillterVocalValueDirectingParam {
    startTime: number;
    endTime: number;
    fillterType: number;
    min: number; // getVocalAmplitude() の値が min 以下の場合、setFilterMixRatio() に 0 を設定する閾値
    max: number; // getVocalAmplitude() の値が max 以下の場合、setFilterMixRatio() に 1 を設定する閾値
}

class FillterVocalValueDirectingParam implements IFillterVocalValueDirectingParam {
    startTime: number;
    endTime: number;
    fillterType: number;
    min: number; // getVocalAmplitude() の値が min 以下の場合、setFilterMixRatio() に 0 を設定する閾値
    max: number; // getVocalAmplitude() の値が max 以下の場合、setFilterMixRatio() に 1 を設定する閾値

    working: FillterAnimationWorkingParam;

    public constructor(param: IFillterVocalValueDirectingParam) {
        this.startTime = param.startTime;
        this.endTime = param.endTime;
        this.fillterType = param.fillterType;
        this.min = param.min;
        this.max = param.max;

        this.working = { startTime: param.startTime, isFinished: false };
    }
}

interface ScreenDirectingParam {
    duration: DerectiongDuration;
    textureKey: string;
}

interface ParticleDirectingParam {
    startPhraseIndex: number;
    endPhraseIndex: number;
    color?: ColorRepresentation[];
}

interface MotionDirectingParam {
    startPhraseIndex: number;
    playMotionNames: string[];
}

// 演出制御クラス
export default class DirectingManager {
    private _player: TextAlivePlayer;
    private _myRenderer: MyRenderer;
    private _screen: ScreenObject;
    private _particleManager: SphereParticleManager;
    private _characterManager: MmdCharacterManager;

    private _fillterDirectingParams: Array<FillterDirectingParam>;
    private _fillterVocalValueDirectingParams: Array<FillterVocalValueDirectingParam>;
    private _screenDirectingParams: Array<ScreenDirectingParam>;
    private _particleDirectingParams: Array<ParticleDirectingParam>;
    private _motionDirectingParams: Array<MotionDirectingParam>;

    private _lastPhraseIndex: number;

    public constructor() {
        // 各種演出用パラメータ保持配列 --------------------------------
        this._fillterDirectingParams = new Array<FillterDirectingParam>();
        this._fillterVocalValueDirectingParams = new Array<FillterVocalValueDirectingParam>();
        this._screenDirectingParams = new Array<ScreenDirectingParam>();
        this._particleDirectingParams = new Array<ParticleDirectingParam>();
        this._motionDirectingParams = new Array<MotionDirectingParam>();
        this._lastPhraseIndex = -1;
    }

    public create(param: DirectingManagerCreateParam): void {
        this._player = param.player;
        this._myRenderer = param.myRenderer;
        this._screen = param.screen;
        this._particleManager = param.particleManager;
        this._characterManager = param.characterManager;

        // 曲固有の演出
        if (param.musicInfoIndex == 0) {
            this.createLoadingMemoriesDirectingParam();
        }
    }

    public restart(): void {
        this._fillterDirectingParams.forEach((param) => {
            param.working.isFinished = false;
        });
        this._fillterVocalValueDirectingParams.forEach((param) => {
            param.working.isFinished = false;
        });
    }

    public createLoadingMemoriesDirectingParam(): void {
        // フィルタ演出用パラメータ --------------------------------
        // todo: 暫定対応を修正
        this._fillterDirectingParams.push(
            new FillterDirectingParam({
                start: {
                    phraseIndex: DefPhraseIndex.Index.START_SEPIA_FILLTER_INDEX,
                    value: 0,
                },
                duration: {
                    time: 200,
                    value: 1,
                },
                fillterType: 2,
            })
        );
        this._fillterDirectingParams.push(
            new FillterDirectingParam({
                start: {
                    phraseIndex: DefPhraseIndex.Index.LAST_CHORUS_INDEX,
                    value: 0,
                },
                duration: {
                    time: 10,
                    value: 0,
                },
                fillterType: 0,
            })
        );

        this._fillterVocalValueDirectingParams.push(
            new FillterVocalValueDirectingParam({
                startTime: 207433, // 「手に入れた物は掛け替えの無いMemory」の IPhrase.endTime
                endTime: 210133, // ラスサビの IRepetitiveSegment.startTime
                fillterType: 1,
                min: 0,
                max: 81615 / 3.9, // IPlayer.getMaxVocalAmplitude() / 3.9
            })
        );

        // スクリーンテクスチャ変更演出用パラメータ --------------------------------
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2013.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2013.END_INDEX,
            },
            textureKey: "mm2013",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2014.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2014.END_INDEX,
            },
            textureKey: "mm2014",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2015.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2015.END_INDEX,
            },
            textureKey: "mm2015",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2016.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2016.END_INDEX,
            },
            textureKey: "mm2016",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2017.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX, // フレーズ間で一瞬元に戻らないよう対応
            },
            textureKey: "mm2017",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2018.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX, // フレーズ間で一瞬元に戻らないよう対応
            },
            textureKey: "mm2018",
        });

        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2019.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX, // フレーズ間で一瞬元に戻らないよう対応
            },
            textureKey: "mm2019",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2020.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX, // フレーズ間で一瞬元に戻らないよう対応
            },
            textureKey: "mm2020",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.MM2021.START_INDEX,
                endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX,
            },
            textureKey: "mm2021",
        });
        this._screenDirectingParams.push({
            duration: {
                startPhraseIndex: DefPhraseIndex.Index.LAST_CHORUS_INDEX,
                endPhraseIndex: DefPhraseIndex.Index.END_INDEX,
            },
            textureKey: "mm10th",
        });

        // パーティクル色変更演出用パラメータ --------------------------------
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2017.START_INDEX,
            endPhraseIndex: DefPhraseIndex.MM2017.END_INDEX,
            color: [DefColor.Miku.IMAGE_COLOR],
        });
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2018.START_INDEX,
            endPhraseIndex: DefPhraseIndex.MM2018.END_INDEX,
            color: [DefColor.Rin.IMAGE_COLOR, DefColor.Len.IMAGE_COLOR],
        });
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2019.START_INDEX,
            endPhraseIndex: DefPhraseIndex.MM2019.END_INDEX,
            color: [DefColor.Luka.IMAGE_COLOR, DefColor.Miku.IMAGE_COLOR],
        });
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2020.START_INDEX,
            endPhraseIndex: DefPhraseIndex.MM2020.END_INDEX,
            color: [DefColor.Meiko.IMAGE_COLOR],
        });
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2021.START_INDEX,
            endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX,
            color: [DefColor.Kaito.IMAGE_COLOR],
        });
        this._particleDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2021.END_INDEX + 1,
            endPhraseIndex: DefPhraseIndex.MM2021.END_INDEX + 1,
        });

        // キャラモーション切り替え変更演出用パラメータ --------------------------------
        // マジカルミライ2015 テーマソング Hand in Hand の CLAP YOUR HANDS! の感じでモーション切り替え
        this._motionDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2015.START_INDEX,
            playMotionNames: ["clap_1"],
        });
        this._motionDirectingParams.push({
            startPhraseIndex: DefPhraseIndex.MM2015.END_INDEX + 1,
            playMotionNames: ["shake_rightarm_2"],
        });
    }

    public update(): void {
        if (!this._player.isPlaying) {
            return;
        }

        const phrase = this._player.findCurrentPhrase();
        const phraseIndex = this._player.findPhraseIndex(phrase);

        // フィルタ演出（パラメータの構造的に作り直すか、実装を隠蔽して可読性上げたい）
        this._fillterDirectingParams.forEach((param) => {
            this.updateFillter(param, phrase, phraseIndex);
        });
        this._fillterVocalValueDirectingParams.forEach((param) => {
            this.updateVocalValueFillter(param, phrase, phraseIndex);
        });

        // スクリーン演出
        this._screenDirectingParams.forEach((param) => {
            if (phraseIndex == param.duration.startPhraseIndex) {
                if (this.isWaitLastChorusStart(phraseIndex)) {
                    // ラスサビタイミング調整
                    return;
                } else {
                    this._screen.switchTexture(param.textureKey);
                }
            }
            if (phraseIndex < 0 && this._lastPhraseIndex == param.duration.endPhraseIndex) {
                this._screen.switchTexture("none");
            }
        });

        // パーティクル色変更演出
        this._particleDirectingParams.forEach((param) => {
            if (param.startPhraseIndex <= phraseIndex && phraseIndex <= param.endPhraseIndex) {
                if (param.color) {
                    this._particleManager.setParticlesColor(param.color);
                } else {
                    this._particleManager.setParticlesOriginColor();
                }
            }
        });

        // キャラモーション切り替え演出
        this._motionDirectingParams.forEach((param) => {
            if (phraseIndex == param.startPhraseIndex) {
                this._characterManager.nameList.forEach((name) => {
                    const chara = this._characterManager.getCharacter(name);
                    const singerName = this._player.musicInfo.singerName;
                    const playMotion = singerName.includes(name) ? ["sing_1"] : param.playMotionNames;
                    chara.play(playMotion);
                });
            }
        });

        // ラスサビ銀テ風演出
        if (this._player.isStartedLastChorus()) {
            this._particleManager.spreadParticles();
        }

        if (-1 < phraseIndex) {
            this._lastPhraseIndex = phraseIndex;
        }
    }

    // ラスサビの開始タイミング待ちか
    // LoadingMemories のラスサビの Phrase.startTime と IRepetitiveSegment.startTime のタイミングにズレが大きい
    // IRepetitiveSegment.startTime の方がいい感じなのでそれまでは演出開始しない為の対応
    private isWaitLastChorusStart(phraseIndex: number): boolean {
        // 調整対象でなければ待ちは発生させない
        if (this._player.musicInfo.id != 0 || phraseIndex != DefPhraseIndex.Index.LAST_CHORUS_INDEX) {
            return false;
        }

        return !this._player.isStartedLastChorus();
    }

    private updateFillter(param: FillterDirectingParam, phrase: IPhrase, phraseIndex: number): void {
        if (param.start.phraseIndex <= phraseIndex && !param.working.isFinished) {
            if (this.isWaitLastChorusStart(phraseIndex)) {
                // ラスサビタイミング調整
                return;
            }

            if (param.working.startTime < 0) {
                // startTime 未設定の場合はここで設定
                param.working.startTime = phrase.startTime;
            }

            // 演出アニメーション
            // todo: イージング対応
            this._myRenderer.setFilterType(param.fillterType);
            const t = MathUtils.inverseLerp(param.working.startTime, param.working.startTime + param.duration.time, this._player.position);
            this._myRenderer.setFilterMixRatio(MathUtils.lerp(param.start.value, param.duration.value, t));

            // 演出終了状態なら終了フラグ立てる
            if (param.working.startTime + param.duration.time < this._player.position) {
                param.working.isFinished = true;
            }
        }
    }

    private updateVocalValueFillter(param: FillterVocalValueDirectingParam, phrase: IPhrase, phraseIndex: number): void {
        if (param.startTime <= this._player.position && !param.working.isFinished) {
            if (param.working.startTime < 0) {
                // startTime 未設定の場合はここで設定
                param.working.startTime = phrase.startTime;
            }

            // 演出アニメーション
            // todo: イージング対応
            // this._myRenderer.setFilterType(param.fillterType);

            let t = MathUtils.inverseLerp(param.min, param.max, this._player.getVocalAmplitude(this._player.position));
            t = MathUtils.clamp(t, 0, 1);
            if (param.fillterType == 1) {
                t -= 1; // 黒フェードは [-1, 0] になるよう調整
            }
            this._myRenderer.setWhiteOutIntensity(t);

            // 演出終了状態なら終了フラグ立てる
            if (param.endTime < this._player.position) {
                this._myRenderer.setWhiteOutIntensity(0);
                param.working.isFinished = true;
            }
        }
    }
}
