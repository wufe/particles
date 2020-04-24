import { IProgram } from "../../programs/webgl-program";
import { ViewBox } from "../../camera/view-box";
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl";
import { BaseProgram } from "../../programs/base-webgl-program";
declare enum Attr {
    POSITION = "v_pos"
}
declare enum Uni {
    COLOR = "v_col"
}
declare type TQuadTreeProgramParams = {
    color: number[];
};
export declare class QuadTreeProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _params;
    private _vectorsBuffer;
    private _vertices;
    private _quadTree;
    private _strideLength;
    private _color;
    constructor(gl: WebGLRenderingContext, viewBox: ViewBox, libraryInterface: IWebGLLibraryInterface, _params: TQuadTreeProgramParams);
    private _getQuadTree;
    init(): void;
    private _updateQuadTree;
    update(deltaT: number, T: number): void;
    private _buildVertices;
    private _getBoundariesFromQuadTree;
    draw(deltaT: number, T: number): void;
}
export {};
