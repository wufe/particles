import { IDrawingInterface } from "./drawing/drawing-interface";
import { ISystemBridge } from "./drawing/system-bridge";
import { TConfiguration } from "./main";
import { IParticle } from "./models/particle";
import { TSystemLinksConfiguration, TParticleSystemBuilder, ParticleSystemRequiredFeature } from "./models/particle-system";
import { IProximityDetectionSystem, TProximityDetectionSystemBuilder } from "./models/proximity-detection/proximity-detection-system";
import { Subject, IObservable, Observable } from "./utils/observable";
import { TRendererBuilder } from "./rendering/renderer";
import { TFeatureBuilder } from "./webgl/features/feature";
import { RecursivePartial } from "./utils/object-utils";

export enum LibraryInterfaceHook {
    RENDERER_INIT = 'rendererInit',
    CONTEXT_INIT = 'contextInit',
    CANVAS_INIT = 'canvasInit',
    PRE_START = 'preStart',
    DRAW = 'draw',
    UPDATE = 'update',
    CANVAS_CLEAR = 'canvasClear',
    SYSTEM_UPDATED = 'systemUpdated',
    WINDOW_RESIZE = 'windowResize',
}

export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;

    updatableParamsObservable: Observable<RecursivePartial<UpdatableParams>>;

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

export type UpdatableParams = {
    camera?: {
        locked?      : boolean;
        depthOfField?: boolean;
        ortho?       : boolean;
        zoom         : {
            value : number;
            locked: boolean;
        }
    };
};

export type Params = UpdatableParams & {
    selectorOrCanvas         : string | HTMLCanvasElement;
    renderer?                : TRendererBuilder;
    systems?                 : TParticleSystemBuilder[];
    proximityDetection?: {
        system?: TProximityDetectionSystemBuilder;
        chunksCount?: number;
    };
    backgroundColor?         : number[];
    detectRetina?            : boolean;
    features?                : TFeatureBuilder[];
    fpsLimit?                : number;
    camera?: {
        enabled?: boolean;
        locked? : boolean;
        pitch?  : number;
        yaw?    : number;
        zoom    : {
            value : number;
            locked: boolean;
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