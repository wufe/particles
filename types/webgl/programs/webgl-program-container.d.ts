export declare class ProgramContainer<TAttribs extends string = string, TUniforms extends string = string> {
    private _gl;
    private _vertexShaderText;
    private _fragmentShaderText;
    private _attributes;
    private _uniforms;
    constructor(_gl: WebGLRenderingContext, _vertexShaderText: string, _fragmentShaderText: string, _attributes: TAttribs[], _uniforms?: TUniforms[]);
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
    getUniformLocation: (uniform: TUniforms) => WebGLUniformLocation;
    uni(uniform: TUniforms): WebGLUniformLocation;
    checkShaderCompilation: (shader: WebGLShader, context: WebGLRenderingContext) => void;
    checkProgramLink: (program: WebGLProgram, context: WebGLRenderingContext) => void;
    checkProgramValidation: (program: WebGLProgram, context: WebGLRenderingContext) => void;
}
