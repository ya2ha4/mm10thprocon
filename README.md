# Recollection MAGICAL MIRAI
Recollection MAGICAL MIRAI は TextAlive App API を用いたリリックアプリです。</br>
本アプリは、初音ミク「マジカルミライ」10th Anniversary プログラミング・コンテスト応募作品になります。</br>

## アプリ説明
### コンセプト、概要
これまでのマジカルミライを想起させるような演出を組み込んだライブをイメージした作品です。</br>

- 歴代のマジカルミライやバーチャルシンガー Anniversary テーマソングをモチーフにした演出
  - 各種テーマソングがマジカルミライのライブで演奏された際にスクリーンに出ていた歌詞表示やMVの歌詞表示を再現した演出
  - 歴代のマジカルミライをモチーフにした演出中にスクリーン風のオブジェクトでその旨をアピール（歌詞演出の元ネタ補足など）
  - ライブのラストで行われる（行われるはずだった）銀テープ演出
  - etc.

### アプリの操作方法、シーケンスについて
- アプリを起動し画面に「READY! / タップ or クリックでスタート」と表示されたら画面を押すことで曲が再生されます
- 曲再生中は画面を押すとペンライトを振りパーティクルが生成されます
  - パーティクルはステージ上に溜まり、ラストのサビでステージに降り注がれます
  - パーティクルはペンライトを振らない場合でも一定時間ごとに自動で生成されます
- 画面左下に表示されている「penlight」の項目を選択することで、ペンライトや振った際に生成されるパーティクルの色を変えることができます
- 曲の再生が終わり「THANK YOU / EVERYBODY / タップ or クリックで最初からスタート」が表示されたら画面を押すことで再度、アプリを体験できます

### 動作確認環境
下記の環境で動作確認していますが、OS/ブラウザのバージョン、ハードウェア構成によっては正しく動作しない可能性があります。</br>
- Windows: Google Chrome, Firefox, Edge
- Mac: Safari, Google Chrome
- Android: Google Chrome
- iOS: Safari, Google Chrome

## セットアップ方法
### 前準備
[Node.js](https://nodejs.org/) をインストールして下さい。</br>

### パッケージのインストール
package.json のあるディレクトリ (app) にて下記コマンドを実行し、パッケージをインストールして下さい。</br>
```
npm install
```

### TextAlive App API トークンの設定
トークンを下記のjsonファイルに設定して下さい。（トークンは https://developer.textalive.jp/ から取得して下さい。）</br>
- 本番用：app/src/textalive/textalive_config.json
- 開発用：app/src/textalive/dev_textalive_config.json

app/src/textalive/TextAlivePlayer.ts 内にjsonファイルを読み込んでいる箇所がありますので、適時書き換えてアプリを動作させて下さい。</br>
```
import config = require("./dev_textalive_config.json");
```

### サーバの起動
下記コマンドを実行することで、サーバが起動します。</br>
```
npm run build-dev
```

下記の出力が表示されていればOKです。</br>
そのurlにアクセスすることでアプリを確認することができます。</br>
> Server running at `http://localhost:****` (**** はデフォルト 1234 のポート番号)

### 再生楽曲の変更方法
app/src/index.ts 内に class MainSequence が実装されており下記の値を変更することで別の楽曲でもアプリを再生することができます。</br>
```
    private static musicInfoIndex = 0;
```

再生可能な楽曲は下記の通りです。</br>
| 値 | 再生楽曲 |
| ---- | ---- |
| 0 | Loading Memories / せきこみごはん feat. 初音ミク |
| 1 | 青に溶けた風船 / シアン・キノ feat. 初音ミク |
| 2 | 歌の欠片と / imo feat. MEIKO |
| 3 | 未完のストーリー / 加賀（ネギシャワーP） feat. 初音ミク |
| 4 | みはるかす / ねこむら（cat nap） feat. 初音ミク |
| 5 | fear / 201 feat. 初音ミク |


## 開発メンバー（五十音順）
- gansakudo
- takanosuke
- ya2ha4


## License
### package
- dat.gui</br>
  本アプリではApach License 2.0 のライセンスで配布されているパッケージがインストールされます</br>
  Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0</br>
  https://github.com/dataarts/dat.gui/blob/master/LICENSE</br>
- textalive-app-api</br>
  https://github.com/TextAliveJp/textalive-app-api/blob/master/LICENSE.md</br>
- three</br>
  Copyright © 2010-2022 three.js authors</br>
  https://github.com/mrdoob/three.js/blob/dev/LICENSE</br>
- copy-files-from-to</br>
  Copyright (c) 2017 webextensions.org</br>
  https://github.com/webextensions/copy-files-from-to/blob/master/LICENSE</br>
- del-cli</br>
  Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)</br>
  https://github.com/sindresorhus/del-cli/blob/main/license</br>
- glslify-bundle</br>
  Copyright (c) 2014 stackgl contributors</br>
  https://github.com/glslify/glslify-bundle/blob/master/LICENSE.md</br>
- parcel</br>
  Copyright (c) 2017-present Devon Govett</br>
  https://github.com/parcel-bundler/parcel/blob/v2/LICENSE</br>
- process</br>
  Copyright (c) 2013 Roman Shtylman <shtylman@gmail.com></br>
  https://github.com/defunctzombie/node-process/blob/master/LICENSE</br>
- typescript</br>
  本アプリではApach License 2.0 のライセンスで配布されているパッケージがインストールされます</br>
  Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0</br>
  https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt</br>

### Model
- ボックスミク ver1.1</br>
  daniwell</br>
  https://aidn.jp/mmd/box_miku/ （ライセンスはモデルデータに同梱）</br>
- ボックスリン ver1.2</br>
  daniwell</br>
  https://aidn.jp/mmd/box_rin/ （ライセンスはモデルデータに同梱）</br>
- ボックスレン ver1.2</br>
  daniwell</br>
  https://aidn.jp/mmd/box_len/ （ライセンスはモデルデータに同梱）</br>
- ボックスルカ ver1.1</br>
  daniwell</br>
  https://aidn.jp/mmd/box_luka/ （ライセンスはモデルデータに同梱）</br>

### Font
- Mplus 1 Code</br>
  Copyright 2021 The M+ FONTS Project Authors</br>
  https://github.com/coz-m/MPLUS_FONTS</br>
- 自家製 Rounded M+</br>
  自家製フォント工房</br>
  http://jikasei.me/font/rounded-mplus/about.html</br>
