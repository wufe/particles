import { IProgram } from "./webgl-program";
import { ViewBox } from "../camera/view-box";
import { IParticle } from "../../models/particle";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export declare enum UpdateableParticlesProgramParam {
    CAMERA = "cam",
    RESOLUTION = "res"
}
export declare class ParticlesLinesProgram implements IProgram {
    private _gl;
    private _viewBox;
    private _libraryInterface;
    private _vectorsBuffer;
    private _programContainer;
    private _willUpdateParams;
    private _vertices;
    private _mapper;
    private _particles;
    private _links;
    constructor(_gl: WebGLRenderingContext, _viewBox: ViewBox, _libraryInterface: IWebGLLibraryInterface);
    notifyParamChange(param: UpdateableParticlesProgramParam): void;
    getResolutionVector(): number[];
    init(particles: IParticle[]): void;
    useParticles(particles: IParticle[]): void;
    particleUpdated: (index: number) => (particle: IParticle) => void;
    private _buildLinks;
    update(deltaT: number, T: number): void;
    draw(): void;
}
