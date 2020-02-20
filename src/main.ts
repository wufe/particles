import { PluginAdapter, HookType } from "./plugin/plugin-adapter";
import { DrawingInterface, IDrawingInterface } from "./drawing/drawing-interface";
import { IRenderer } from "./rendering/renderer";
import { Renderer2D } from "./rendering/renderer-2d";
import { getDefault, LazyFactory, DefaultObject } from "./utils/object-utils";
import { IParticleSystem, IParticleSystemBuilder } from "./models/particle-system";
import { ISystemBridge, SystemBridgeEventNotification } from "./drawing/system-bridge";
import { IParticle } from "./models/particle";
import { DefaultParticleSystem } from "./systems/default-particle-system";
import { ParticleSectorManager } from "./models/particle-sector-manager";

export const getDefaultParams = (): DefaultObject<Params> => ({
    selectorOrCanvas: '#canvas',
    renderer: new LazyFactory(() => new Renderer2D()),
    systems: new LazyFactory(() => [DefaultParticleSystem]),
    backgroundColor: [34, 34, 34, 0],
    detectRetina: true,
    camera: {
        enabled: true,
        pitch: 0,
        yaw: 0
    }
});

export interface ILibraryInterface extends IDrawingInterface, ISystemBridge {
    params: Params;
    internals: InternalParams;
    time: number;
    deltaTime: number;
    particlesSectorManager: ParticleSectorManager;
    getAllParticles: () => IParticle[]
}

export class Main extends DrawingInterface implements ILibraryInterface {
    private _plugin = new PluginAdapter();
    public internals: InternalParams = {
        initialized: false,
    };
    public particlesSectorManager: ParticleSectorManager;
    public systems: IParticleSystem[] = [];

    constructor(public params: Params) {
        super();
        this._loop = this._loop.bind(this);
    }

    start() {
        this._initParams();
        this._initRenderer();
        this._initContext();
        this._initCanvas();
        this._initSystems();
        this._preStart();
        this._loop();
    }

    private _initParams() {
        this.params = getDefault(this.params, getDefaultParams());
        this.systems = this.params.systems.map(builder => new builder(this));
        let canvas = this.params.selectorOrCanvas;
        if (typeof canvas === 'string')
            canvas = document.querySelector(canvas) as HTMLCanvasElement;
        this._canvas = canvas;
    }

    private _initRenderer() {
        this.params.renderer.register(this._plugin);
        this._plugin.exec(HookType.RENDERER_INIT, this);
    }

    private _initContext() {
        this._plugin.exec(HookType.CONTEXT_INIT, this);
    }

    private _initCanvas() {
        let { clientWidth: width, clientHeight: height } = this.canvas;
        if (this.params.detectRetina) {
            const pixelRatio = window.devicePixelRatio;
            if (pixelRatio > 1) {
                this.internals.isRetina = true;
                this.internals.pixelRatio = pixelRatio;
                width = this.canvas.offsetWidth * pixelRatio;
                height = this.canvas.offsetHeight * pixelRatio;
            } else {
                this.internals.pixelRatio = 1;
                this.internals.isRetina = false;
            }
        }
        this.internals.width    = width;
        this.internals.height   = height;
        this.canvas.width       = width;
        this.canvas.height      = height;
        this._plugin.exec(HookType.CANVAS_INIT, this);
    }

    private _initSystems() {
        const {width, height} = this.internals;
        this.particlesSectorManager = new ParticleSectorManager(width, height);
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
        this.time = performance.now();
        this.deltaTime = this.time - this._lastPerf;
        this._lastPerf = this.time;
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
    renderer?           : IRenderer;
    systems?            : IParticleSystemBuilder[];
    backgroundColor?    : number[];
    detectRetina?       : boolean;
    camera?: {
        enabled?: boolean;
        pitch?  : number;
        yaw?    : number;
    };
    // This parameter should be set by the system, and not by the library
    //particles?          : RecursivePartial<ParticlesProps>;
};

export type InternalParams = {
    pixelRatio?   : number;
    isRetina?     : boolean;
    initialized   : boolean;
    width?        : number;
    height?       : number;
    [k            : string]: any;
};

export const init = (params: Params) => {

    new Main(params).start();
}

