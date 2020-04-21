import { PluginAdapter, HookType } from "./plugin/plugin-adapter";
import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer, IRendererBuilder } from "./rendering/renderer";
import { Renderer2D } from "./rendering/renderer-2d";
import { getDefault, LazyFactory, DefaultObject } from "./utils/object-utils";
import { IParticleSystem, IParticleSystemBuilder, SystemLinksConfiguration } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle } from "./models/particle";
import { DefaultParticleSystem } from "./systems/default-particle-system";
import { BaseParticleSystem } from "./systems/base-particle-system";
import { IProximityDetectionSystemBuilder, IProximityDetectionSystem } from "./models/proximity-detection/proximity-detection-system";
import { NaiveProximityDetectionSystem, NaiveProximityDetectionSystemBuilder } from "./models/proximity-detection/naive-proximity-detection-system";
import { performanceMetricsHelper } from "./utils/performance-metrics";

export const getDefaultParams = (): DefaultObject<Params> => ({
    selectorOrCanvas: '#canvas',
    renderer: new LazyFactory(() => Renderer2D),
    systems: [DefaultParticleSystem],
    proximityDetectionSystem: NaiveProximityDetectionSystemBuilder.build(),
    backgroundColor: [0, 0, 0, 0],
    detectRetina: true,
    fpsLimit: 0,
    features: [
        Feature.LINKS,
    ],
    camera: {
        enabled: true,
        pitch: 0,
        yaw: 0,
        zoom: {
            value: 2,
            locked: false
        },
        ortho: false,
        fov: Math.PI / 5,
        depthOfField: false
    },
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
});

export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    configuration: TConfiguration;
    time: number;
    deltaTime: number;
    getAllParticles: () => IParticle[];
    getAllLinkableParticles: () => [IParticle[], SystemLinksConfiguration];
    feedProximityDetectionSystem(objects: IParticle[]): void;
    getNeighbours(particle: IParticle, radius: number): IParticle[];
    getProximityDetectionSystem(): IProximityDetectionSystem;
}

export class Main extends DrawingInterface implements ILibraryInterface {
    private _plugin = new PluginAdapter();
    public configuration: TConfiguration = {
        initialized: false,
    };
    public systems: IParticleSystem[] = [];
    public proximityDetectionSystem: IProximityDetectionSystem | null = null;;
    public renderer: IRenderer = null;

    constructor(public params: Params) {
        super();
        this._loop = this._loop.bind(this);
    }

    start() {
        this._initParams();
        this._initRenderer();
        this._initContext();
        this._initCanvas();
        this._initResizeEventListeners();
        this._initSystems();
        this._initProximityDetectionSystems();
        this._preStart();
        this._loop();
    }

    private _initParams() {
        this.params = getDefault(this.params, getDefaultParams());
        this.systems = this.params.systems.map(builder => new builder(this));
        this.proximityDetectionSystem = new this.params.proximityDetectionSystem(this);
        this.renderer = new this.params.renderer(this._plugin);
        let canvas = this.params.selectorOrCanvas;
        if (typeof canvas === 'string')
            canvas = document.querySelector(canvas) as HTMLCanvasElement;
        this._canvas = canvas;
    }

    private _initRenderer() {
        this.renderer.register();
        this._plugin.exec(HookType.RENDERER_INIT, this);
    }

    private _initContext() {
        this._plugin.exec(HookType.CONTEXT_INIT, this);
    }

    private _initCanvas() {
        this._configureSize();
        this._plugin.exec(HookType.CANVAS_INIT, this);
    }

    private _resizeDebounceTimer: number | null = null;
    private _initResizeEventListeners() {
        const resizeEvent = this.params.events.resize;
        if (resizeEvent.enabled) {
            window.addEventListener('resize', () => {
                if (resizeEvent.debounce === -1 || resizeEvent.debounce === 0) {
                    this._configureSize();
                    this._plugin.exec(HookType.WINDOW_RESIZE, this);
                } else {
                    clearTimeout(this._resizeDebounceTimer);
                    this._resizeDebounceTimer = setTimeout(() => {
                        this._configureSize();
                        this._plugin.exec(HookType.WINDOW_RESIZE, this);
                    }, resizeEvent.debounce);
                }
            });
        }
    }

    private _configureSize() {
        let { clientWidth: width, clientHeight: height } = this.canvas;
        if (this.params.detectRetina) {
            const pixelRatio = window.devicePixelRatio;
            if (pixelRatio > 1) {
                this.configuration.isRetina = true;
                this.configuration.pixelRatio = pixelRatio;
                width = this.canvas.offsetWidth * pixelRatio;
                height = this.canvas.offsetHeight * pixelRatio;
            } else {
                this.configuration.pixelRatio = 1;
                this.configuration.isRetina = false;
            }
        }
        this.configuration.width  = width;
        this.configuration.height = height;
        this.configuration.depth  = Math.max(width, height);
        this.canvas.width         = width;
        this.canvas.height        = height;
    }

    private _initSystems() {
        const {width, height, depth} = this.configuration;
        this.systems.forEach(x => x.attach());
    }

    private _initProximityDetectionSystems() {
        this.proximityDetectionSystem.init();
    }

    private _preStart() {
        this._plugin.exec(HookType.PRE_START, this);
    }

    public time = 0;
    public deltaTime = 0;
    private _lastPerf = 0;
    private _loop () {

        const fpsLimit = this.params.fpsLimit;

        // #region Update

        const currentPerf = performance.now();

        
        let delta = currentPerf - this._lastPerf;
        const fps = 1000 / delta;

        if (fpsLimit > 0 && delta < (1000 / fpsLimit) +1) {
            requestAnimationFrame(this._loop);
        } else {
            delta = Math.min(delta, 30);

            this.deltaTime = delta;
            
            this.time += this.deltaTime;
            this._lastPerf = currentPerf;
    
            performanceMetricsHelper.set('fps', fps);
    
            this.systems.forEach(system => {
                (system as BaseParticleSystem).updateInternalParameters(this.deltaTime, this.time);
                if (system.tick)
                    system.tick(this.deltaTime, this.time);
            });
            this._plugin.exec(HookType.UPDATE, this);
            // #endregion
    
            // #region Draw
            this._plugin.exec(HookType.CANVAS_CLEAR, this);
            this._plugin.exec(HookType.DRAW, this);
            // #endregion
    
            // Loop
            requestAnimationFrame(this._loop);
        }

        
    }

    notify(type: SystemBridgeEventNotification, system: IParticleSystem) {
        if (type === SystemBridgeEventNotification.SYSTEM_UPDATED) {
            this._plugin.exec(HookType.SYSTEM_UPDATED, this);
        }
    }

    getAllParticles() {
        return this.systems.map(system => system.getParticles()).flat();
    }

    getAllLinkableParticles(): [IParticle[], SystemLinksConfiguration] {
        let linesConfiguration: SystemLinksConfiguration = { required: false };
        let particles: IParticle[][] = [];
        this.systems
            .forEach(system => {
                if (system.links.required) {
                    linesConfiguration = system.links;
                    particles.push(system.getParticles());
                }
            });
        return [particles.flat(), linesConfiguration];
    }

    feedProximityDetectionSystem(objects: IParticle[]) {
        this.proximityDetectionSystem.update(objects);
    }

    getNeighbours(particle: IParticle, radius: number) {
        return this.proximityDetectionSystem.getNeighbours(particle, radius);
    }

    getProximityDetectionSystem() {
        return this.proximityDetectionSystem;
    }
}

export enum Feature {
    LINKS      = 'links',
    DIRECTIONS = 'directions',
    QUAD_TREE  = 'quadTree',
}

export type Params = {
    selectorOrCanvas         : string | HTMLCanvasElement;
    renderer?                : IRendererBuilder;
    systems?                 : IParticleSystemBuilder[];
    proximityDetectionSystem?: IProximityDetectionSystemBuilder;
    backgroundColor?         : number[];
    detectRetina?            : boolean;
    features?                : Feature[];
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
    // This parameter should be set by the system, and not by the library
    //particles?          : RecursivePartial<ParticlesProps>;
};

export type TConfiguration = {
    pixelRatio?            : number;
    isRetina?              : boolean;
    initialized            : boolean;
    width?                 : number;
    height?                : number;
    depth?                 : number;
    [k            : string]: any;
};

export const init = (params: Params) => {

    new Main(params).start();
}

