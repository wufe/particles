import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer, TRendererBuilder } from "./rendering/renderer";
import { Renderer2DBuilder } from "./rendering/renderer-2d";
import { getDefault, LazyFactory, DefaultObject, RecursivePartial } from "./utils/object-utils";
import { IParticleSystem, TParticleSystemBuilder, TSystemLinksConfiguration, ParticleSystemRequiredFeature } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle, Particle } from "./models/particle";
import { DefaultParticleSystem, DefaultParticleSystemBuilder } from "./systems/default-particle-system";
import { BaseParticleSystem } from "./systems/base-particle-system";
import { TProximityDetectionSystemBuilder, IProximityDetectionSystem } from "./models/proximity-detection/proximity-detection-system";
import { NaiveProximityDetectionSystemBuilder } from "./models/proximity-detection/naive-proximity-detection-system";
import { performanceMetricsHelper } from "./utils/performance-metrics";
import { TFeatureBuilder } from "./webgl/features/feature";
import { Subject, BehaviorSubject, IObservable, ISubject } from "./utils/observable";
import { Params, ILibraryInterface, TOnResize, LibraryInterfaceHook, UpdatableParams } from "./library-interface";
import { RendererWebGLBuilder } from "./rendering/renderer-webgl";
import { ProximityManager } from "./models/proximity-detection/proximity-manager";

export const getDefaultParams = (): DefaultObject<Params> => ({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGLBuilder.build(),
    systems: [DefaultParticleSystemBuilder.build()],
    proximityDetection: {
        system: NaiveProximityDetectionSystemBuilder.build(),
        chunksCount: 5,
    },
    backgroundColor: [0, 0, 0, 0],
    detectRetina: true,
    fpsLimit: 0,
    features: [],
    camera: {
        enabled: true,
        locked: false,
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
    },
});

export class Main extends DrawingInterface implements ILibraryInterface {
    public configuration: TConfiguration = {
        initialized: false,
    };
    public systems: IParticleSystem[] = [];
    public proximityDetectionSystem: IProximityDetectionSystem | null = null;
    public proximityManager: ProximityManager | null = null;
;
    public renderer: IRenderer = null;

    public onResize: ISubject<TOnResize>;
    public hooks: {
        [k in LibraryInterfaceHook]?: ISubject<ILibraryInterface>;
    } = {
        [LibraryInterfaceHook.RENDERER_INIT]: new Subject()
    };
    public updatableParamsObservable = new Subject<RecursivePartial<UpdatableParams>>();

    public params: Params;

    constructor(params: RecursivePartial<Params>) {
        super();
        this.params = getDefault(params, getDefaultParams());
        this._loop = this._loop.bind(this);
    }

    start(): this {
        this._initHooks();
        this._initParams();
        this._initRenderer();
        this._initContext();
        this._initCanvas();
        this._initResizeEventListeners();
        this._initSystems();
        this._initProximityDetectionSystems();
        this._preStart();
        this._loop();
        return this;
    }

    private _initHooks() {
        Object.values(LibraryInterfaceHook)
            .forEach(type => this.hooks[type] = new Subject());
    }

    public set(params: RecursivePartial<UpdatableParams>): void;
    public set(paramsSetter: (params: Params) => RecursivePartial<UpdatableParams>): void;
    public set(params: RecursivePartial<UpdatableParams> | ((params: Params) => RecursivePartial<UpdatableParams>)) {
        if (typeof params === 'function') {
            const paramsObject = params(this.params);
            this.params = getDefault<Params, UpdatableParams>(paramsObject, this.params);
            this.updatableParamsObservable.next(paramsObject);
        } else {
            this.params = getDefault<Params, UpdatableParams>(params, this.params);
            this.updatableParamsObservable.next(params);
        }
    }

    private _initParams() {
        
        this.systems = this.params.systems.map(builder => builder.build(this));
        this.proximityDetectionSystem = this.params.proximityDetection.system.build(this);

        this.proximityManager = new ProximityManager();
        this.proximityManager.setProximityDetectionSystem(this.proximityDetectionSystem);

        this.renderer = this.params.renderer.build(this);
        let canvas = this.params.selectorOrCanvas;
        if (typeof canvas === 'string')
            canvas = document.querySelector(canvas) as HTMLCanvasElement;
        this._canvas = canvas;
    }

    private _initRenderer() {
        this.renderer.register();
        this.hooks[LibraryInterfaceHook.RENDERER_INIT].next(this);
    }

    private _initContext() {
        this.hooks[LibraryInterfaceHook.CONTEXT_INIT].next(this);
    }

    private _initCanvas() {
        this._configureSize();
        this.hooks[LibraryInterfaceHook.CANVAS_INIT].next(this);
    }

    private _resizeDebounceTimer: number | null = null;
    private _initResizeEventListeners() {
        const resizeEvent = this.params.events.resize;
        if (resizeEvent.enabled) {
            window.addEventListener('resize', () => {
                if (resizeEvent.debounce === -1 || resizeEvent.debounce === 0) {
                    this._configureSize();
                    this.hooks[LibraryInterfaceHook.WINDOW_RESIZE].next(this);
                } else {
                    clearTimeout(this._resizeDebounceTimer);
                    this._resizeDebounceTimer = setTimeout(() => {
                        this._configureSize();
                        this.hooks[LibraryInterfaceHook.WINDOW_RESIZE].next(this);
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
        const depth = Math.max(width, height);
        this.configuration.width  = width;
        this.configuration.height = height;
        this.configuration.depth  = depth;
        this.canvas.width         = width;
        this.canvas.height        = height;
        const resizeParameter: TOnResize = { width, height, depth, isRetina: this.configuration.isRetina, pixelRatio: this.configuration.pixelRatio };
        if (!this.onResize)
            this.onResize = new BehaviorSubject(resizeParameter);
        this.onResize.next(resizeParameter);
    }

    private _initSystems() {
        this.systems.forEach(x => x.attach());
    }

    private _initProximityDetectionSystems() {
        this.proximityDetectionSystem.init();
    }

    private _preStart() {
        this.hooks[LibraryInterfaceHook.PRE_START].next(this);
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


            const start = performance.now();

            delta = Math.min(delta, 30);

            this.deltaTime = delta;
            
            this.time += this.deltaTime;
            this._lastPerf = currentPerf;
    
            performanceMetricsHelper.set('fps', Math.round(fps));
    
            this.systems.forEach(system => {
                (system as BaseParticleSystem).updateInternalParameters(this.deltaTime, this.time);
                if (system.tick)
                    system.tick(this.deltaTime, this.time);
            });
            this.hooks[LibraryInterfaceHook.UPDATE].next(this);
            // #endregion
    
            // #region Draw
            this.hooks[LibraryInterfaceHook.CANVAS_CLEAR].next(this);
            this.hooks[LibraryInterfaceHook.DRAW].next(this);
            // #endregion

            const end = performance.now();
            performanceMetricsHelper.set('loop', Math.round(end-start));

            (window as any)['performanceMetrics'] = performanceMetricsHelper;
    
            // Loop
            requestAnimationFrame(this._loop);
        }

        
    }

    notify(type: SystemBridgeEventNotification, system: IParticleSystem) {
        if (type === SystemBridgeEventNotification.SYSTEM_UPDATED) {
            this.hooks[LibraryInterfaceHook.SYSTEM_UPDATED].next(this);
        }
    }

    getAllParticles() {
        return this.systems.map(system => system.getParticles()).flat();
    }

    getParticlesBySystemFeature(feature: ParticleSystemRequiredFeature) {
        return this.systems
            .filter(system => system.requirements.includes(feature))
            .map(system => system.getParticles())
            .flat();
    }

    isSystemFeatureRequired(feature: ParticleSystemRequiredFeature) {
        return this.systems
            .some(system => system.requirements.includes(feature));
    }

    feedProximityDetectionSystem(objects: IParticle[]) {
        this.proximityManager.feedProximityDetectionSystem(objects);
        this.proximityManager.update(this.params.proximityDetection.chunksCount);
    }

    getNeighbours(particle: IParticle, radius: number) {
        if (radius <= 0)
            return [];
        return this.proximityDetectionSystem.getNeighbours(particle, radius);
    }

    getProximityDetectionSystem() {
        return this.proximityDetectionSystem;
    }
}



export type TConfiguration = {
    pixelRatio?            : number;
    isRetina?              : boolean;
    initialized            : boolean;
    width?                 : number;
    height?                : number;
    depth?                 : number;
    [k            : string]: any;
};

export const init = (params: Params): Main => {

    return new Main(params).start();
}

