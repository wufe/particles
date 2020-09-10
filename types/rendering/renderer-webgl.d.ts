import { TRendererBuilder } from "./renderer";
import { ParticlesProgram } from "../webgl/programs/webgl-particles-program";
import { IViewBox } from "../webgl/camera/view-box";
import { IFeature } from "../webgl/features/feature";
import { IProgram } from "../webgl/programs/webgl-program";
import { ILibraryInterface } from "../library-interface";
export declare enum WebGLProgram {
    PARTICLES = "particles",
    LINES = "lines",
    DIRECTIONS = "directions",
    QUADTREE = "quadtree"
}
export declare type TWebGLConfiguration = {
    backgroundColor: number[];
    camera: {
        enabled: boolean;
        locked: boolean;
        pitch: number;
        yaw: number;
        zoom: {
            value: number;
            locked: boolean;
        };
        ortho: boolean;
        fov: number;
    };
    viewBox: IViewBox | null;
    features: {
        feature: IFeature;
        program?: IProgram;
    }[];
    programs: {
        [WebGLProgram.PARTICLES]: ParticlesProgram | null;
    };
};
export interface IWebGLLibraryInterface extends ILibraryInterface {
    context: WebGLRenderingContext;
    configuration: ILibraryInterface['configuration'] & {
        webgl: TWebGLConfiguration;
    };
}
export declare const getColor: (r: number, g: number, b: number, a?: number) => number[];
export declare class RendererWebGLBuilder {
    static build: () => TRendererBuilder;
}
