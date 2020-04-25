import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer, IRendererBuilder } from "./rendering/renderer";
import { DefaultObject } from "./utils/object-utils";
import { IParticleSystem, TParticleSystemBuilder, TSystemLinksConfiguration } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle } from "./models/particle";
import { IProximityDetectionSystemBuilder, IProximityDetectionSystem } from "./models/proximity-detection/proximity-detection-system";
import { TFeatureBuilder } from "./webgl/features/feature";
export declare const getDefaultParams: () => DefaultObject<Params>;
export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;
    getAllParticles: () => IParticle[];
    getAllLinkableParticles: () => [IParticle[], TSystemLinksConfiguration];
    feedProximityDetectionSystem(objects: IParticle[]): void;
    getNeighbours(particle: IParticle, radius: number): IParticle[];
    getProximityDetectionSystem(): IProximityDetectionSystem;
}
export declare class Main extends DrawingInterface implements ILibraryInterface {
    params: Params;
    private _plugin;
    configuration: TConfiguration;
    systems: IParticleSystem[];
    proximityDetectionSystem: IProximityDetectionSystem | null;
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
    private _initProximityDetectionSystems;
    private _preStart;
    time: number;
    deltaTime: number;
    private _lastPerf;
    private _loop;
    notify(type: SystemBridgeEventNotification, system: IParticleSystem): void;
    getAllParticles(): IParticle[];
    getAllLinkableParticles(): [IParticle[], TSystemLinksConfiguration];
    feedProximityDetectionSystem(objects: IParticle[]): void;
    getNeighbours(particle: IParticle, radius: number): IParticle[];
    getProximityDetectionSystem(): IProximityDetectionSystem;
}
export declare enum Feature {
    LINKS = "links",
    DIRECTIONS = "directions",
    QUAD_TREE = "quadTree"
}
export declare type Params = {
    selectorOrCanvas: string | HTMLCanvasElement;
    renderer?: IRendererBuilder;
    systems?: TParticleSystemBuilder[];
    proximityDetectionSystem?: IProximityDetectionSystemBuilder;
    backgroundColor?: number[];
    detectRetina?: boolean;
    features?: TFeatureBuilder[];
    fpsLimit?: number;
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
        depthOfField?: boolean;
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
