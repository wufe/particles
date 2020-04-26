import { IProgram } from "./webgl-program";
import { IViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { BaseProgram } from "./base-webgl-program";
declare enum Attr {
    POSITION = "v_pos",
    COLOR = "v_col",
    SIZE = "f_size",
    POSITION_TRANSITION_ENABLED = "t_position_enabled",
    POSITION_TRANSITION_START = "t_position_start",
    POSITION_TRANSITION_END = "t_position_end",
    POSITION_TRANSITION_START_TIME = "t_position_start_time",
    POSITION_TRANSITION_END_TIME = "t_position_end_time",
    POSITION_TRANSITION_EASING_FUNCTION = "t_position_easing_function"
}
declare enum Uni {
    EYE = "v_eye",
    DEPTH_OF_FIELD = "f_dof"
}
export declare class ParticlesProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _vectorsBuffer;
    private _vertices;
    private _strideLength;
    constructor(gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface);
    getResolutionVector(): number[];
    init(): void;
    useParticles(): void;
    private _updateEventAttachedParticles;
    private _attachParticleUpdateEventHandler;
    private _onParticleUpdate;
    private _emptyEventAttachedParticles;
    draw(deltaT: number, T: number): void;
}
export {};
