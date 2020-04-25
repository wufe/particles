import { ILibraryInterface } from "../../main";
import { IProgram } from "../programs/webgl-program";
import { ViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export declare type TFeatureBuilder = {
    build(manager: ILibraryInterface): IFeature;
};
export interface IFeature {
    buildProgram?: (gl: WebGLRenderingContext, viewBox: ViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) => this;
    getProgram?: () => IProgram;
    isAvailable(): boolean;
}