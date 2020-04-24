import { IVector3D, Vector3D } from "./vector3d";
export interface IVector4D extends IVector3D {
    w: number;
}
export declare const ZeroVector4D: {
    x: number;
    y: number;
    z: number;
    w: number;
};
export declare class Vector4D extends Vector3D {
    w: number;
    constructor(vec?: Pick<IVector4D, 'x' | 'y' | 'z' | 'w'>);
    get components(): number[];
    clone(): Vector4D;
    add(vector: IVector3D | IVector4D): Vector4D;
    add(scalar: number): Vector4D;
    sub(vector: IVector3D | IVector4D): this;
    div(scalar: number): this;
    mul(scalar: number): this;
    get length(): number;
    unit(): this;
    cross(vector: IVector4D): this;
    static fromArray(components: number[]): Vector4D;
}
