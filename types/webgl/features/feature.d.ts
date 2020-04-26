import { IProgram } from "../programs/webgl-program";
import { IViewBox } from "../camera/view-box";
import { ILibraryInterface } from "../../library-interface";
export declare type TFeatureBuilder = {
    build(manager: ILibraryInterface): IFeature;
};
export interface IFeature {
    buildProgram?: (gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: ILibraryInterface, ...args: any[]) => this;
    getProgram?: () => IProgram;
    isAvailable(): boolean;
}
