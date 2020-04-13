import { mat4 } from "gl-matrix";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export declare class ViewBox {
    private _library;
    wMat: mat4;
    vMat: mat4;
    pMat: mat4;
    constructor(_library: IWebGLLibraryInterface);
    calculate(): void;
    recalculate(): void;
    getResolutionVector(): number[];
}
