import { IProgram, IProgramBuilder } from "../programs/webgl-program";
import { IViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { ILibraryInterface } from "../../library-interface";

export type TFeatureBuilder =  {
    build(manager: ILibraryInterface): IFeature;
}

export interface IFeature {
    buildProgram?: (gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) => this;
    getProgram?: () => IProgram;
    isAvailable(): boolean;
}