import { Vector3 } from "three/src/math/Vector3";
import { Color } from "three";

export namespace DefDevelop {
    export class Debug {
        static readonly ENABLE_DEBUG = false;

        // デバッグ用：youtube の動画を表示するか
        // 本番環境は false
        // コンテスト用の設定と異なる為、歌詞の再生タイミングや楽曲地図情報が変わるため注意
        static readonly USING_YOUTUBE_MEDIA = false;
    }
}

export namespace DefPosition {
    export class Stage {
        // 床面
        public static readonly FLOOR_WIDTH = 150;
        public static readonly FLOOR_DEPTH = 150;

        // ステージ
        public static readonly STAGE_WIDTH = Stage.FLOOR_WIDTH;
        public static readonly STAGE_HEIGHT = 3;
        public static readonly STAGE_DEPTH = 50;
        public static readonly STAGE_POS = new Vector3(0, Stage.STAGE_HEIGHT / 2, (Stage.STAGE_DEPTH - Stage.FLOOR_DEPTH) / 2.0);

        // スクリーン
        public static readonly SCREEN_WIDTH = 1920 * 0.075;
        public static readonly SCREEN_HEIGHT = 1080 * 0.075;

        public static readonly SCREEN_POS = new Vector3(0, Stage.SCREEN_HEIGHT / 2 + 20, -Stage.FLOOR_DEPTH / 2.0);
    }

    export class Lyric {
        // 歌詞1行表示デフォルト位置
        public static readonly DEFAULT_POS = new Vector3(0, Stage.SCREEN_POS.y * 0.775, Stage.STAGE_POS.z);

        // 歌詞2行表示デフォルト位置
        public static readonly DEFAULT_2LINE_POS = [
            new Vector3(0, Stage.SCREEN_POS.y * 0.775 + 8, Stage.STAGE_POS.z),
            new Vector3(0, Stage.SCREEN_POS.y * 0.775 - 8, Stage.STAGE_POS.z),
        ];

        // 画面端
        public static readonly LEFT_POS = new Vector3(-160, Lyric.DEFAULT_POS.y, Lyric.DEFAULT_POS.z);
        public static readonly RIGHT_POS = new Vector3(160, Lyric.DEFAULT_POS.y, Lyric.DEFAULT_POS.z);
    }
}

export namespace DefColor {
    export class Miku {
        public static readonly IMAGE_COLOR = new Color(57 / 255, 197 / 255, 187 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(232 / 255, 242 / 255, 241 / 255);
    }

    export class Rin {
        public static readonly IMAGE_COLOR = new Color(255 / 255, 85 / 255, 0 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(255 / 255, 244 / 255, 226 / 255);
    }

    export class Len {
        public static readonly IMAGE_COLOR = new Color(255 / 255, 188 / 255, 17 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(255 / 255, 252 / 255, 233 / 255);
    }

    export class Luka {
        public static readonly IMAGE_COLOR = new Color(255 / 255, 125 / 255, 144 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(255 / 255, 240 / 255, 243 / 255);
    }

    export class Meiko {
        public static readonly IMAGE_COLOR = new Color(216 / 255, 0 / 255, 0 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(249 / 255, 227 / 255, 229 / 255);
    }

    export class Kaito {
        public static readonly IMAGE_COLOR = new Color(0 / 255, 0 / 255, 255 / 255);
        public static readonly PALE_IMAGE_COLOR = new Color(239 / 255, 239 / 255, 249 / 255);
    }
}

export namespace DefPhraseIndex {
    export class MM2013 {
        public static readonly START_INDEX = 2;
        public static readonly END_INDEX = 4;
    }
    export class MM2014 {
        public static readonly START_INDEX = 12;
        public static readonly END_INDEX = 15;
    }
    export class MM2015 {
        public static readonly START_INDEX = 5;
        public static readonly END_INDEX = 11;
    }
    export class MM2016 {
        public static readonly START_INDEX = 22;
        public static readonly END_INDEX = 26;
    }
    export class MM2017 {
        public static readonly START_INDEX = 27;
        public static readonly END_INDEX = 30;
    }
    export class MM2018 {
        public static readonly START_INDEX = 31;
        public static readonly END_INDEX = 32;
    }
    export class MM2019 {
        public static readonly START_INDEX = 33;
        public static readonly END_INDEX = 34;
    }
    export class MM2020 {
        public static readonly START_INDEX = 35;
        public static readonly END_INDEX = 36;
    }
    export class MM2021 {
        public static readonly START_INDEX = 37;
        public static readonly END_INDEX = 38;
    }
    export class Index {
        public static readonly START_SEPIA_FILLTER_INDEX = 42;
        public static readonly LAST_CHORUS_INDEX = 44;
        public static readonly END_INDEX = 49;
    }
}
