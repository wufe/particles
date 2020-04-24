import { IProgram } from "../../programs/webgl-program";
import { ViewBox } from "../../camera/view-box";
import { IParticle } from "../../../models/particle";
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl";
import { SystemLinksConfiguration } from "../../../models/particle-system";
import { BaseProgram } from "../../programs/base-webgl-program";
declare enum Attr {
    POSITION = "v_position",
    COLOR = "v_color",
    POSITION_OTHER = "v_positionOther"
}
declare enum Uni {
    MAX_DISTANCE = "f_maxDistance"
}
export declare class LinksProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _vectorsBuffer;
    private _vertices;
    private _mapper;
    private _lines;
    private _links;
    private _maxParticleDistance;
    constructor(gl: WebGLRenderingContext, viewBox: ViewBox, libraryInterface: IWebGLLibraryInterface);
    init(): void;
    _useParticles(particles: IParticle[], linksConfiguration: SystemLinksConfiguration): void;
    update(deltaT: number, T: number): void;
    draw(deltaT: number, T: number): void;
}
export {};
