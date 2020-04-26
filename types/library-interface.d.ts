import { IDrawingInterface } from "./drawing/drawing-interface";
import { ISystemBridge } from "./drawing/system-bridge";
import { TConfiguration } from "./main";
import { IParticle } from "./models/particle";
import { TParticleSystemBuilder, ParticleSystemRequiredFeature } from "./models/particle-system";
import { IProximityDetectionSystem, IProximityDetectionSystemBuilder } from "./models/proximity-detection/proximity-detection-system";
import { IObservable } from "./utils/observable";
import { TRendererBuilder } from "./rendering/renderer";
import { TFeatureBuilder } from "./webgl/features/feature";
export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;
    getAllParticles: () => IParticle[];
    getParticlesBySystemFeature: (feature: ParticleSystemRequiredFeature) => IParticle[];
    feedProximityDetectionSystem(objects: IParticle[]): void;
    getNeighbours(particle: IParticle, radius: number): IParticle[];
    getProximityDetectionSystem(): IProximityDetectionSystem;
    onResize: IObservable<TOnResize>;
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
