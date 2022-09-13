import { IBeat } from "textalive-app-api";
import { Scene } from "three";

import MmdCharacter, { MmdCharacterCreateParam } from "./MmdCharacter";
import TextAlivePlayer from "./textalive/TextAlivePlayer";

export default class MmdCharacterManager {
    private _scene: Scene;
    private _player: TextAlivePlayer;
    private _characters: Map<string, MmdCharacter>;

    public constructor(scene: Scene, player: TextAlivePlayer) {
        this._scene = scene;
        this._player = player;
        this._characters = new Map<string, MmdCharacter>();
    }

    public dispose(): void {
        this._characters.forEach((character, _) => {
            character.dispose();
        });
        this._characters.clear();
    }

    public createCharacters(params: MmdCharacterCreateParam[]): void {
        params.forEach((param) => {
            const onCreated = (chara: MmdCharacter) => {
                this._scene.add(chara.mesh);
            };
            const chara = new MmdCharacter();
            this._characters.set(param.name, chara);
            chara.create(param, onCreated);
        });
    }

    public update(delta: number): void {
        // ビートによってモーション時間を調整
        const beat = this._player.findBeat();
        if (beat) {
            this.setDurationByBeat(beat);
        }

        this.characterList.forEach((character) => {
            character.update(delta);
        });
    }

    public isLoaded(): boolean {
        // キャラクターリストが定義されているか
        if (this.characterList.length > 0) {
            // 全て読み込み済みならtrueを返す
            return this.characterList.every((character) => {
                return character.loaded;
            });
        } else {
            return false;
        }
    }
    public setDurationByBeat(beat: IBeat): void {
        this.characterList.forEach((character) => {
            // ビートの長さとモーションの長さをあわせる
            character.setDurationByBeat(beat.duration / 1000, beat.length);
        });
    }

    public get characterList(): MmdCharacter[] {
        return Array.from(this._characters.values());
    }

    public get nameList(): string[] {
        return Array.from(this._characters.keys());
    }

    public getCharacter(name: string): MmdCharacter {
        return this._characters.get(name);
    }
}

