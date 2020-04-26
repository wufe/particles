import { mat4 } from "gl-matrix";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { IVector3D, Vector3D } from "../../models/vector3d";
export declare class IViewBox {
    wMat: Iterable<number>;
    vMat: Iterable<number>;
    pMat: Iterable<number>;
    eye: IVector3D;
    recalculate: () => void;
    getResolutionVector: () => number[];
}
export declare class ViewBox implements IViewBox {
    private _library;
    wMat: mat4;
    vMat: mat4;
    pMat: mat4;
    eye: Vector3D | null;
    constructor(_library: IWebGLLibraryInterface);
    map(val: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
    calculate(): void;
    recalculate(): void;
    getResolutionVector(): number[];
}
