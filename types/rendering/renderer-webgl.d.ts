import { PluginAdapter } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
import { ILibraryInterface } from "../main";
import { ParticlesProgram } from "../webgl/programs/webgl-particles-program";
import { ViewBox } from "../webgl/camera/view-box";
import { IFeature } from "../webgl/features/feature";
import { IProgram } from "../webgl/programs/webgl-program";
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
        pitch: number;
        yaw: number;
        zoom: {
            value: number;
            locked: boolean;
        };
        ortho: boolean;
        fov: number;
    };
    viewBox: ViewBox | null;
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
export declare class RendererWebGL implements IRenderer {
    private _pluginAdapter;
    constructor(_pluginAdapter: PluginAdapter);
    register(): void;
    private _initRenderer;
    private _initContext;
    private _initCanvas;
    private _preStart;
    private _clearCanvas;
    private _update;
    private _draw;
    private _onResize;
    private _onCameraChange;
    private _onSystemUpdated;
    private _callSystemsConfigurationHooks;
}
