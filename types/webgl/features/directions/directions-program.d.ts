import { IViewBox } from "../../camera/view-box";
import { BaseProgram } from "../../programs/base-webgl-program";
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl";
import { IProgram } from "../../programs/webgl-program";
declare enum Attr {
    POSITION = "v_pos",
    COLOR = "v_col"
}
export declare class DirectionsProgram extends BaseProgram<Attr> implements IProgram {
    private _vectorsBuffer;
    private _vertices;
    private _strideLength;
    constructor(gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface);
    init(): void;
    private _buildVertices;
    draw(deltaT: number, T: number): void;
}
export {};
