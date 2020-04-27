import { IProgram } from "../../programs/webgl-program";
import { IViewBox } from "../../camera/view-box";
import { IParticle } from "../../../models/particle";
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl";
import { BaseProgram } from "../../programs/base-webgl-program";
import { TLinksFeatureParams } from "./links-feature";
declare enum Attr {
    POSITION = "v_position",
    COLOR = "v_color",
    POSITION_OTHER = "v_positionOther",
    MAX_DISTANCE = "f_maxDistance"
}
declare enum Uni {
    MAX_DISTANCE = "f_maxDistance"
}
export declare class LinksProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _params;
    private _vectorsBuffer;
    private _vertices;
    private _mapper;
    constructor(gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface, _params: TLinksFeatureParams);
    init(): void;
    _useParticles(particles: IParticle[]): void;
    update(deltaT: number, T: number): void;
    draw(deltaT: number, T: number): void;
}
export {};
