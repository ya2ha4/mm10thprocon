import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";

export default class MeshObject {
    protected _mesh: Mesh;
    protected _position: Vector3;
    protected _rotation: Vector3;
    protected _scale: Vector3;
    protected _mode: number;

    constructor(mesh: Mesh) {
        this._mesh = mesh;
    }

    public set mesh(mesh: Mesh) {
        this._mesh = mesh;
    }

    public get mesh(): Mesh {
        return this._mesh;
    }

    public set position(position: Vector3) {
        this._position = position;
        this._mesh.position.set(position.x, position.y, position.z);
    }

    public set rotation(rotation: Vector3) {
        this._rotation = rotation;
        this._mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    public set scale(scale: Vector3) {
        this._scale = scale;
        this._mesh.scale.set(scale.x, scale.y, scale.z);
    }

    public get mode(): number {
        return this._mode;
    }

    public set mode(state: number) {
        this._mode = state;
    }

    public update(elapsed: number): void {
        // ページにアクセスしてからの経過時間
        const sec = performance.now() / 1000;
        switch (this._mode) {
            // uchu_miku (audience)
            case 40: {
                this._mesh.rotation.set(0, 0, 0.1 * Math.cos(sec * 2));
                break;
            }
            case 41: {
                this._mesh.rotation.set(0, 0, 0.1 * Math.cos(sec * 2));
                let positionY = Math.max(0, this._position.y + 5 * Math.sin(sec * 2));
                this._mesh.position.set(this._position.x, positionY, this._position.z);
                break;
            }
            // Psyllium
            case 50: {
                this._mesh.rotation.set(0.2 * Math.cos(sec * 10), 0, 0.03 * Math.cos(sec * 2));
                break;
            }
            case 51: {
                this._mesh.rotation.set(0.2 * Math.cos(sec * 10), 0, 0.03 * Math.cos(sec * 2));
                let positionY = Math.max(0, this._position.y - 5 * Math.sin(sec * 4));
                this._mesh.position.set(this._position.x, positionY, this._position.z);
                break;
            }
            default: {
                console.log(`default`);
                break;
            }
        }
    }
}
