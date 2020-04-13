import { IProgram } from "./webgl-program";
import { ViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { ParticleSectorManager } from "../../models/particle-sector-manager";
export declare enum UpdateableSectorsProgramParam {
    CAMERA = "cam",
    RESOLUTION = "res"
}
export declare class ParticlesSectorsProgram implements IProgram {
    private _gl;
    private _viewBox;
    private _libraryInterface;
    private _vectorsBuffer;
    private _programContainer;
    private _willUpdateParams;
    private _vertices;
    constructor(_gl: WebGLRenderingContext, _viewBox: ViewBox, _libraryInterface: IWebGLLibraryInterface);
    notifyParamChange(param: UpdateableSectorsProgramParam): void;
    getResolutionVector(): number[];
    init(sectorsManager: ParticleSectorManager): void;
    useSectors(sectorsManager: ParticleSectorManager): void;
    update(deltaT: number, T: number): void;
    draw(): void;
}
