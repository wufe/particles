import { VectorNorm } from "./vector-norm";
export interface IVector3D {
    x: number;
    y: number;
    z: number;
    components: number[];
}
export declare const ZeroVector3D: {
    x: number;
    y: number;
    z: number;
};
export declare class Vector3D {
    x: number;
    y: number;
    z: number;
    protected norm: VectorNorm;
    constructor({ x, y, z }?: Pick<IVector3D, 'x' | 'y' | 'z'>);
    get components(): number[];
    clone(): Vector3D;
    add(vector: IVector3D): Vector3D;
    add(scalar: number): Vector3D;
    sub(vector: IVector3D): this;
    div(scalar: number): this;
    mul(scalar: number): this;
    dot(vector: IVector3D): number;
    angle(vector: Vector3D): number;
    get length(): number;
    unit(): this | {
        x: number;
        y: number;
        z: number;
    };
    cross(vector: IVector3D): this;
    static fromArray(components: number[]): Vector3D;
}
