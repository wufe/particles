import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer, IRendererBuilder } from "./rendering/renderer";
import { DefaultObject } from "./utils/object-utils";
import { IParticleSystem, IParticleSystemBuilder } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle } from "./models/particle";
export declare const getDefaultParams: () => DefaultObject<Params>;
export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;
    getAllParticles: () => IParticle[];
}
export declare class Main extends DrawingInterface implements ILibraryInterface {
    params: Params;
    private _plugin;
    configuration: TConfiguration;
    systems: IParticleSystem[];
    renderer: IRenderer;
    constructor(params: Params);
    start(): void;
    private _initParams;
    private _initRenderer;
    private _initContext;
    private _initCanvas;
    private _resizeDebounceTimer;
    private _initResizeEventListeners;
    private _configureSize;
    private _initSystems;
    private _preStart;
    time: number;
    deltaTime: number;
    private _lastPerf;
    private _loop;
    notify(type: SystemBridgeEventNotification, system: IParticleSystem): void;
    getAllParticles(): any[];
}
export declare type Params = {
    selectorOrCanvas: string | HTMLCanvasElement;
    renderer?: IRendererBuilder;
    systems?: IParticleSystemBuilder[];
    backgroundColor?: number[];
    detectRetina?: boolean;
    camera?: {
        enabled?: boolean;
        pitch?: number;
        yaw?: number;
        zoom?: {
            value?: number;
            locked?: boolean;
        };
        ortho?: boolean;
        fov?: number;
    };
    events?: {
        resize?: {
            enabled?: boolean;
            debounce?: number;
        };
    };
};
export declare type TConfiguration = {
    pixelRatio?: number;
    isRetina?: boolean;
    initialized: boolean;
    width?: number;
    height?: number;
    depth?: number;
    [k: string]: any;
};
export declare const init: (params: Params) => void;
