import { IProgram } from "./webgl-program";
import { ViewBox } from "../camera/view-box";
import { IParticle } from "../../models/particle";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export declare enum UpdateableParticlesProgramParam {
    CAMERA = "cam",
    RESOLUTION = "res"
}
export declare class ParticlesProgram implements IProgram {
    private _gl;
    private _viewBox;
    private _libraryInterface;
    private _vectorsBuffer;
    private _programContainer;
    private _willUpdateParams;
    private _vertices;
    private _strideLength;
    constructor(_gl: WebGLRenderingContext, _viewBox: ViewBox, _libraryInterface: IWebGLLibraryInterface);
    notifyParamChange(param: UpdateableParticlesProgramParam): void;
    getResolutionVector(): number[];
    init(particles: IParticle[]): void;
    useParticles(particles: IParticle[]): void;
    private _updateEventAttachedParticles;
    private _attachParticleUpdateEventHandler;
    private _onParticleUpdate;
    private _emptyEventAttachedParticles;
    update(deltaT: number, T: number): void;
    draw(): void;
}
