import { IDrawingInterface } from "./drawing/drawing-interface";
import { ISystemBridge } from "./drawing/system-bridge";
import { TConfiguration } from "./main";
import { IParticle } from "./models/particle";
import { TParticleSystemBuilder, ParticleSystemRequiredFeature } from "./models/particle-system";
import { IProximityDetectionSystem, TProximityDetectionSystemBuilder } from "./models/proximity-detection/proximity-detection-system";
import { IObservable } from "./utils/observable";
import { TRendererBuilder } from "./rendering/renderer";
import { TFeatureBuilder } from "./webgl/features/feature";
export declare enum LibraryInterfaceHook {
    RENDERER_INIT = "rendererInit",
    CONTEXT_INIT = "contextInit",
    CANVAS_INIT = "canvasInit",
    PRE_START = "preStart",
    DRAW = "draw",
    UPDATE = "update",
    CANVAS_CLEAR = "canvasClear",
    SYSTEM_UPDATED = "systemUpdated",
    WINDOW_RESIZE = "windowResize"
}
export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;
    getAllParticles: () => IParticle[];
    getParticlesBySystemFeature: (feature: ParticleSystemRequiredFeature) => IParticle[];
    isSystemFeatureRequired: (feature: ParticleSystemRequiredFeature) => boolean;
    feedProximityDetectionSystem(objects: IParticle[]): void;
    getNeighbours(particle: IParticle, radius: number): IParticle[];
    getProximityDetectionSystem(): IProximityDetectionSystem;
    onResize: IObservable<TOnResize>;
    hooks: {
        [k in LibraryInterfaceHook]?: IObservable<ILibraryInterface>;
    };
}
export declare type TOnResize = {
    width: number;
    height: number;
    depth: number;
    pixelRatio: number;
    isRetina: boolean;
};
export declare enum Feature {
    LINKS = "links",
    DIRECTIONS = "directions",
    QUAD_TREE = "quadTree"
}
export declare type Params = {
    selectorOrCanvas: string | HTMLCanvasElement;
    renderer?: TRendererBuilder;
    systems?: TParticleSystemBuilder[];
    proximityDetection?: {
        system?: TProximityDetectionSystemBuilder;
        chunksCount?: number;
    };
    backgroundColor?: number[];
    detectRetina?: boolean;
    features?: TFeatureBuilder[];
    fpsLimit?: number;
    camera?: {
        enabled?: boolean;
        locked?: boolean;
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
