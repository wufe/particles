import { IDrawingInterface } from "./drawing/drawing-interface";
import { ISystemBridge } from "./drawing/system-bridge";
import { TConfiguration } from "./main";
import { IParticle } from "./models/particle";
import { TSystemLinksConfiguration, TParticleSystemBuilder } from "./models/particle-system";
import { IProximityDetectionSystem, IProximityDetectionSystemBuilder } from "./models/proximity-detection/proximity-detection-system";
import { Subject } from "./utils/observable";
import { IRendererBuilder } from "./rendering/renderer";
import { TFeatureBuilder } from "./webgl/features/feature";

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

    onResize: Subject<TOnResize>;
}

export type TOnResize = {
    width: number;
    height: number;
    depth: number;
    pixelRatio: number;
    isRetina: boolean;
};

export enum Feature {
    LINKS      = 'links',
    DIRECTIONS = 'directions',
    QUAD_TREE  = 'quadTree',
}

export type Params = {
    selectorOrCanvas         : string | HTMLCanvasElement;
    renderer?                : IRendererBuilder;
    systems?                 : TParticleSystemBuilder[];
    proximityDetectionSystem?: IProximityDetectionSystemBuilder;
    backgroundColor?         : number[];
    detectRetina?            : boolean;
    features?                : TFeatureBuilder[];
    fpsLimit?                : number;
    camera?: {
        enabled?: boolean;
        pitch?  : number;
        yaw?    : number;
        zoom?   : {
            value? : number;
            locked?: boolean;
        };
        ortho?       : boolean;
        fov?         : number;
        depthOfField?: boolean;
    };
    events?: {
        resize?: {
            enabled?: boolean;
            debounce?: number;
        }
    };
};