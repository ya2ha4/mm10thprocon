import { Vector3 } from "three/src/math/Vector3";
import { Texture } from "three/src/textures/Texture";

// 歌詞表示スクリーン（スクリーンは画像表示にするため、不使用）
export default class TextTexture {
    private _canvas: HTMLCanvasElement;
    private _texture: Texture;
    private _textContext: CanvasRenderingContext2D;
    private _textFillStyle: string;
    private _bgFillStyle: string;
    private _scrollPosX: number;

    private _text: string;

    public constructor() {
        // 未初期化メンバ関数が無いようにする
        this._canvas = null;
        this._texture = null;
        this._textContext = null;
        this._textFillStyle = null;
        this._textFillStyle = null;
        this._scrollPosX = 0;

        // null を明確に許容しない場合のみ非nullで初期化
        this._text = "";
    }

    public update() {
        const scrollSpeed = 2; // todo: テキストが見切れないよう、表示時間またはスピードを設定出来るようにする
        this._scrollPosX -= scrollSpeed;
        const textWidth: number = this._textContext.measureText(this.text).width;
        // rem: 暫定的にループを無効化
        // todo: スクロールが完了した際、ループさせるかどうかを外部から指定できるようにする
        // if (this._scrollPosX < -textWidth) {
        //     this.resetScroll();
        // }

        // 背景リセット
        this._textContext.fillStyle = this._bgFillStyle;
        this._textContext.fillRect(0, 0, 100, 100);
        // テキストセット
        this._textContext.fillStyle = this._textFillStyle;
        this._textContext.fillText(this.text, this._scrollPosX, 20);
        this._texture.needsUpdate = true;
    }

    // rem: 複数の create****() を含んだり、処理の実行順に制約がある場合は build****() のような形で、実行順を意識せずに済む関数を用意するのもOK
    // rem: build****() を用意する場合、 create****() は private にする
    // public buildTexture(srcText: string, font: string): Texture {
    //     this.text = srcText;
    //     this.createTexture();
    //     this.settingTextContext(font, new Vector3(), new Vector3());
    //     return this._texture;
    // }

    // rem: new を含む場合、関数名を create****() にする
    public createTexture(): Texture {
        this._canvas = document.createElement("canvas");
        this._canvas.width = 64;
        this._canvas.height = 32;
        this._textContext = this._canvas.getContext("2d");

        this.settingTextContext("16px 'メイリオ'", new Vector3(0, 0, 0), new Vector3(57, 197, 187));

        this._textContext.fillStyle = "rgb(200, 30, 100)";
        this._textContext.fillText(this.text, 0, 20);

        this._texture = new Texture(this._canvas);
        return this._texture;
    }

    public settingTextContext(font: string, textColor: Vector3, bgColor: Vector3) {
        if (this._textContext == null) {
            console.warn("textContext はまだ生成されていません");
            return;
        }

        this._textContext.font = font;
        this._textFillStyle = `rgb(${textColor.x}, ${textColor.y}, ${textColor.z})`;
        this._bgFillStyle = `rgb(${bgColor.x}, ${bgColor.y}, ${bgColor.z})`;
    }

    public resetScroll() {
        // rem: 未実装や暫定処理の場合、『// todo: 「必要な処理」』という形でコメントを付ける
        // todo: 適切なリセット位置の設定（テクスチャの横幅 * 0.5）
        this._scrollPosX = 100;
    }

    // rem: メンバを返すだけのアクセッサはプロパティ（public get ****(), public set ****()）で実装する
    public get texture(): Texture {
        return this._texture;
    }

    public set text(srcText: string) {
        this._text = srcText;
    }

    public get text(): string {
        return this._text;
    }
}
