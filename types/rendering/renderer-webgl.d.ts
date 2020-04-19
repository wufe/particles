import { PluginAdapter } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
import { ILibraryInterface } from "../main";
import { ParticlesProgram } from "../webgl/programs/webgl-particles-program";
import { ViewBox } from "../webgl/camera/view-box";
import { ParticlesLinesProgram } from "../webgl/programs/webgl-particles-lines-program";
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
    programs: {
        particles: ParticlesProgram | null;
        lines: ParticlesLinesProgram | null;
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
    private _draw;
    private _update;
    private _onResize;
    private _onCameraChange;
    private _onSystemUpdated;
    private _callSystemsConfigurationHooks;
}
