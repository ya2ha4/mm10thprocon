import { IPhrase } from "textalive-app-api";
import { Vector3 } from "three/src/math/Vector3";

import { DefPosition } from "../../ConstantDefine";
import { TextSentence } from "../../SentenceManager";
import { idolAnimation, moveAnimation, ObjectAnimation, ObjectAnimationParam, rotationFromAxisAngleAnimation } from "../animation/AnimationFunction";
import { easelinear, easeOutExpo } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { LyricObjectUtils } from "./LyricObjectUtils";

/**
 *  歌詞オブジェクト：飛び出してくる感じのやつ
 */
export default class PopoutLyricLyricObject extends BaseLyricObject {
    protected _lyricObjects: Array<TextSentence>;

    constructor() {
        super();

        this._lyricObjects = new Array<TextSentence>();
    }

    public override dispose(): void {
        super.dispose();
        this._lyricObjects.forEach((lyricObject) => {
            this._sentenceManager.removeSentence(lyricObject.getId());
        });
    }

    public override create(param: LyricObjectCreateParam): void {
        super.create(param);

        let c = param.phrase.firstChar;
        while (c && !(param.phrase.lastChar.startTime < c.startTime)) {
            // 1文字分のオブジェクト生成
            // 文字オブジェクト生成
            const char = this._sentenceManager.addTextSentence({
                baseParam: {
                    position: DefPosition.Lyric.DEFAULT_POS,
                    isBloom: true,
                },
                text: c.text,
                color: 0xffffff,
                outlineColor: 0xff00ff,
            });

            {
                // 表示＋定位置で待機させる
                let animation = new ObjectAnimationParam({
                    start: {
                        time: param.phrase.startTime,
                    },
                    end: {
                        time: param.phrase.endTime,
                    },
                    ease: easelinear,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(idolAnimation, animation));
            }

            this._lyricObjects.push(char);
            c = c.next;
        }
        this.registryMoveAnimation(this._lyricObjects, param.phrase);
    }

    private registryMoveAnimation(lyricBlock: Array<TextSentence>, phrase: IPhrase): void {
        // 1文字ずつ横並びさせる
        LyricObjectUtils.lineUpHorizontally(lyricBlock, DefPosition.Lyric.DEFAULT_POS, 2);

        // 広がる感じのアニメーション
        lyricBlock.forEach((char) => {
            const posX = -char.getPosition().x * 0.1;
            const posZ = Math.abs(char.getPosition().x) / 1.5;
            const posY = -posZ / 4;
            const angle = Math.atan2(-char.getPosition().x, -char.getPosition().z);
            let animation = new ObjectAnimationParam({
                start: {
                    time: phrase.startTime,
                    position: DefPosition.Lyric.DEFAULT_POS,
                    angle: 0,
                    rotateAxis: new Vector3(0, 1, 0),
                },
                end: {
                    time: phrase.endTime,
                    position: new Vector3().copy(char.getPosition()).add(new Vector3(posX, posY, posZ)),
                    angle: angle,
                },
                ease: easeOutExpo,
                sentence: char,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, animation));
            this._animationList.push(new ObjectAnimation(rotationFromAxisAngleAnimation, animation));
        });
    }
}
