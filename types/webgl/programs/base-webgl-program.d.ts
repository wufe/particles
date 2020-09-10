import { IViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export interface IBaseProgram<TUniforms extends string = string> {
    init(): void;
    uniformChanged(uniform: BaseUniformAggregationType | TUniforms): void;
}
export declare enum BaseUniforms {
    RESOLUTION = "v_res",
    WORLD = "m_world",
    VIEW = "m_view",
    PROJECTION = "m_projection",
    T = "f_t",
    ZOOM = "f_zoom"
}
export declare enum BaseUniformAggregationType {
    CAMERA = "camera",
    RESOLUTION = "resolution"
}
export declare class BaseProgram<TAttribs extends string = string, TUniforms extends string = string, TFlags extends string = string> implements IBaseProgram<TUniforms> {
    protected _gl: WebGLRenderingContext;
    protected _vertexShaderText: string;
    protected _fragmentShaderText: string;
    protected _attributes: TAttribs[];
    protected _uniforms: (TUniforms | BaseUniforms)[];
    protected _viewBox: IViewBox;
    protected _libraryInterface: IWebGLLibraryInterface;
    protected _uniformsToUpdate: {
        [k in (BaseUniformAggregationType | TUniforms)]?: boolean;
    };
    constructor(_gl: WebGLRenderingContext, _vertexShaderText: string, _fragmentShaderText: string, _attributes: TAttribs[], _uniforms: (TUniforms | BaseUniforms)[], _viewBox: IViewBox, _libraryInterface: IWebGLLibraryInterface);
    init(): void;
    addCodeFragment(): void;
    removeCodeFragment(): void;
    uniformChanged(uniform: BaseUniformAggregationType | TUniforms): void;
    update(deltaT: number, T: number): void;
    draw(deltaT: number, T: number): void;
    getResolutionVector(): number[];
    get program(): WebGLProgram;
    private _vertexShader;
    private _fragmentShader;
    private compileShaders;
    private _program;
    private createProgram;
    private _attributesLocations;
    private _uniformsLocations;
    private findLocations;
    getAttributeLocation: (attrib: TAttribs) => number;
    attr(attrib: TAttribs): number;
    getUniformLocation: (uniform: TUniforms | BaseUniforms) => WebGLUniformLocation;
    uni(uniform: TUniforms | BaseUniforms): WebGLUniformLocation;
    checkShaderCompilation: (shader: WebGLShader, context: WebGLRenderingContext) => void;
    checkProgramLink: (program: WebGLProgram, context: WebGLRenderingContext) => void;
    checkProgramValidation: (program: WebGLProgram, context: WebGLRenderingContext) => void;
}
