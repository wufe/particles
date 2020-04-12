import { PluginAdapter, HookType } from "./plugin/plugin-adapter";
import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer, IRendererBuilder } from "./rendering/renderer";
import { Renderer2D } from "./rendering/renderer-2d";
import { getDefault, LazyFactory, DefaultObject } from "./utils/object-utils";
import { IParticleSystem, IParticleSystemBuilder } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle } from "./models/particle";
import { DefaultParticleSystem } from "./systems/default-particle-system";
import { ParticleSectorManager } from "./models/particle-sector-manager";

export const getDefaultParams = (): DefaultObject<Params> => ({
    selectorOrCanvas: '#canvas',
    renderer: new LazyFactory(() => Renderer2D),
    systems: [DefaultParticleSystem],
    backgroundColor: [0, 0, 0, 0],
    detectRetina: true,
    camera: {
        enabled: true,
        pitch: 0,
        yaw: 0,
        zoom: {
            value: 2,
            locked: false
        },
        ortho: false,
        fov: Math.PI / 5
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
    particlesSectorManager: ParticleSectorManager;
    getAllParticles: () => IParticle[]
}

export class Main extends DrawingInterface implements ILibraryInterface {
    private _plugin = new PluginAdapter();
    public configuration: TConfiguration = {
        initialized: false,
    };
    public particlesSectorManager: ParticleSectorManager;
    public systems: IParticleSystem[] = [];
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
        this._preStart();
        this._loop();
    }

    private _initParams() {
        this.params = getDefault(this.params, getDefaultParams());
        this.systems = this.params.systems.map(builder => new builder(this));
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
        this.particlesSectorManager = new ParticleSectorManager(width, height, depth);
        this.systems.forEach(x => x.attach());
    }

    private _preStart() {
        this._plugin.exec(HookType.PRE_START, this);
    }

    public time = 0;
    public deltaTime = 0;
    private _lastPerf = 0;
    private _loop () {
        // #region Update

        const currentPerf = performance.now();
        this.deltaTime = Math.min(currentPerf - this._lastPerf, 30);
        this.time += this.deltaTime;
        this._lastPerf = currentPerf;

        this.systems.forEach(x => x.tick && x.tick(this.deltaTime, this.time));
        this._plugin.exec(HookType.UPDATE, this);
        // #endregion

        // #region Draw
        this._plugin.exec(HookType.CANVAS_CLEAR, this);
        this._plugin.exec(HookType.DRAW, this);
        // #endregion

        // Loop
        requestAnimationFrame(this._loop);
    }

    notify(type: SystemBridgeEventNotification, system: IParticleSystem) {
        if (type === SystemBridgeEventNotification.SYSTEM_UPDATED) {
            this._plugin.exec(HookType.SYSTEM_UPDATED, this);
        }
    }

    getAllParticles() {
        return this.systems.reduce((accumulator, system) => accumulator.concat(system.getParticles()), []);
    }
}

export type Params = {
    selectorOrCanvas    : string | HTMLCanvasElement;
    renderer?           : IRendererBuilder;
    systems?            : IParticleSystemBuilder[];
    backgroundColor?    : number[];
    detectRetina?       : boolean;
    camera?: {
        enabled?: boolean;
        pitch?  : number;
        yaw?    : number;
        zoom?   : {
            value?: number;
            locked?: boolean;
        };
        ortho?  : boolean;
        fov?    : number;
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

