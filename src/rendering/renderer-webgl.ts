import { PluginAdapter, HookType } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
import { ILibraryInterface } from "../main";
import { IVector4D } from "../models/vector4d";
import { ParticlesProgram, UpdateableParticlesProgramParam } from "../webgl/programs/webgl-particles-program";
import { ViewBox } from "../webgl/camera/view-box";
import { CameraEvents } from "../webgl/camera/camera-events";
import { getDefault } from "../utils/object-utils";
import { TParticleSystemConfiguration, RendererHook, TWebGLRendererHooksConfiguration } from "../models/particle-system";
import { ParticlesLinesProgram } from "../webgl/programs/webgl-particles-lines-program";
import { DirectionsProgram, UpdateableDirectionsProgramParam } from "../webgl/programs/webgl-directions-program";
import { performanceMetricsHelper } from "../utils/performance-metrics";

export type TWebGLConfiguration = {
    backgroundColor: number[];
    camera: {
        enabled: boolean;
        pitch  : number;
        yaw    : number;
        zoom   : {
            value: number;
            locked: boolean;
        };
        ortho  : boolean;
        fov    : number;
    };
    directions: {
        enabled: boolean;
    };
    viewBox: ViewBox | null;
    programs: {
        particles : ParticlesProgram | null;
        lines     : ParticlesLinesProgram | null;
        directions: DirectionsProgram | null;
    };
}

export interface IWebGLLibraryInterface extends ILibraryInterface {
    context: WebGLRenderingContext;
    configuration: ILibraryInterface['configuration'] & {
        webgl: TWebGLConfiguration;
    }
}

export const getColor = (r: number, g: number, b: number, a: number = 1) =>
    [ (1 / 255) * r, (1 / 255) * g, (1 / 255) * b, a ];

export class RendererWebGL implements IRenderer {

    constructor(private _pluginAdapter: PluginAdapter) {}

    register() {
        this._pluginAdapter.addAfter(HookType.RENDERER_INIT, this._initRenderer.bind(this));
        this._pluginAdapter.addAfter(HookType.CONTEXT_INIT, this._initContext.bind(this));
        this._pluginAdapter.addAfter(HookType.CANVAS_INIT, this._initCanvas.bind(this));
        this._pluginAdapter.addAfter(HookType.PRE_START, this._preStart.bind(this));
        this._pluginAdapter.addAfter(HookType.CANVAS_CLEAR, this._clearCanvas.bind(this));
        this._pluginAdapter.addAfter(HookType.DRAW, this._draw.bind(this));
        this._pluginAdapter.addAfter(HookType.UPDATE, this._update.bind(this));
        this._pluginAdapter.addAfter(HookType.WINDOW_RESIZE, this._onResize.bind(this));
    }

    private _initRenderer(libraryInterface: IWebGLLibraryInterface) {
        
        const [r, g, b, a] = libraryInterface.params.backgroundColor;
        const backgroundColor = getColor(r, g, b, a);

        const { enabled, pitch, yaw, zoom, ortho, fov } = libraryInterface.params.camera;
        
        const webglConfiguration: TWebGLConfiguration = {
            backgroundColor,
            programs: {
                particles : null,
                lines     : null,
                directions: null,
            },
            viewBox: null,
            camera: {
                enabled,
                pitch,
                yaw,
                zoom: {
                    locked: zoom.locked,
                    value: zoom.value
                },
                ortho,
                fov,
            },
            directions: {
                enabled: true
            }
        };
        libraryInterface.configuration.webgl = webglConfiguration;
    }

    private _initContext(libraryInterface: IWebGLLibraryInterface) {
        let context: WebGLRenderingContext;

        const customContext = this._callSystemsConfigurationHooks(libraryInterface, RendererHook.INIT_CONTEXT, [libraryInterface.canvas]);

        if (customContext)
            context = customContext;
        else
            context = libraryInterface.canvas.getContext('webgl');
        
        libraryInterface.context = context;
    }

    private _initCanvas(libraryInterface: IWebGLLibraryInterface) {
        const { width, height } = libraryInterface.configuration;
        const context = libraryInterface.context;
        context.viewport(0, 0, width, height);

        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
        // context.enable(context.DEPTH_TEST);
		context.enable(context.CULL_FACE);
		context.cullFace(context.BACK);
        context.frontFace(context.CW);

        this._callSystemsConfigurationHooks(libraryInterface, RendererHook.INIT_CANVAS, [context]);
    }

    

    private _preStart(libraryInterface: IWebGLLibraryInterface) {
        const { width, height, depth } = libraryInterface.configuration;
        const context = libraryInterface.context;
        const webgl = libraryInterface.configuration.webgl;

        // #region ViewBox
        const viewBox = new ViewBox(libraryInterface);
        webgl.viewBox = viewBox;
        // #endregion

        // #region CameraEvents
        const canvas = libraryInterface.canvas;
        const cameraEvents = new CameraEvents(libraryInterface);
        cameraEvents.bind(canvas);
        cameraEvents.onChange = this._onCameraChange.bind(this)(libraryInterface);
        // #endregion

        if (webgl.directions.enabled) {
            const directionsProgram = new DirectionsProgram(context, viewBox);
            directionsProgram.init();
            webgl.programs.directions = directionsProgram;
        }

        const particles = libraryInterface.getAllParticles();

        // #region Particles program
        const particlesProgram = new ParticlesProgram(context, viewBox, libraryInterface);
        particlesProgram.init(particles);
        webgl.programs.particles = particlesProgram;
        // #endregion

        // Create lines
        libraryInterface.feedProximityDetectionSystem(particles);

        // #region Lines program
        const linesProgram = new ParticlesLinesProgram(context, viewBox, libraryInterface);
        linesProgram.init(particles);
        webgl.programs.lines = linesProgram;
        // #endregion

        // #region Particles change events
        this._pluginAdapter.addAfter(HookType.SYSTEM_UPDATED, this._onSystemUpdated.bind(this));
        // #endregion
    }

    private _clearCanvas(libraryInterface: IWebGLLibraryInterface) {
        const webglConfiguration = libraryInterface.configuration.webgl;
        const context = libraryInterface.context;
        const [r, g, b, a] = webglConfiguration.backgroundColor;
        context.clearColor(r, g, b, a);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }

    private _draw(libraryInterface: IWebGLLibraryInterface) {
        const programs = libraryInterface.configuration.webgl.programs;
        if (programs.directions)
            programs.directions.draw();
        programs.particles.draw();
        programs.lines.draw();
    }

    private _update(libraryInterface: IWebGLLibraryInterface) {
        const programs = libraryInterface.configuration.webgl.programs;
        if (programs.directions)
            programs.directions.update(libraryInterface.deltaTime, libraryInterface.time);
        programs.particles.update(libraryInterface.deltaTime, libraryInterface.time);

        const particles = libraryInterface.getAllParticles();

        performanceMetricsHelper.set('particles', particles);

        programs.lines.useParticles(particles);

        programs.lines.update(libraryInterface.deltaTime, libraryInterface.time);
    }

    private _onResize(libraryInterface: IWebGLLibraryInterface) {
        const {width, height, depth} = libraryInterface.configuration;
        if (libraryInterface.configuration.webgl.programs.directions)
            libraryInterface.configuration.webgl.programs.directions.notifyParamChange(UpdateableDirectionsProgramParam.RESOLUTION);
        libraryInterface.configuration.webgl.programs.particles.notifyParamChange(UpdateableParticlesProgramParam.RESOLUTION);
        libraryInterface.configuration.webgl.programs.lines.notifyParamChange(UpdateableParticlesProgramParam.RESOLUTION);
        this._onCameraChange(libraryInterface);
        libraryInterface.context.viewport(0, 0, width, height);
    }

    private _onCameraChange(libraryInterface: IWebGLLibraryInterface) {
        const webgl = libraryInterface.configuration.webgl;
        return () => {
            webgl.viewBox.recalculate();
            if (webgl.programs.directions)
                webgl.programs.directions.notifyParamChange(UpdateableDirectionsProgramParam.CAMERA);
            webgl.programs.particles.notifyParamChange(UpdateableParticlesProgramParam.CAMERA);
            webgl.programs.lines.notifyParamChange(UpdateableParticlesProgramParam.CAMERA);
        };
    }

    private _onSystemUpdated(libraryInterface: IWebGLLibraryInterface) {
        const particles = libraryInterface.getAllParticles();
        libraryInterface.configuration.webgl.programs.particles.useParticles(particles);
    }

    private _callSystemsConfigurationHooks(libraryInterface: IWebGLLibraryInterface, hookType: RendererHook, params: any[]) {

        let retValue: any;

        const defaultWebGLHooksConfiguration: TParticleSystemConfiguration = {
            renderer: {
                webgl: <TWebGLRendererHooksConfiguration>{
                    initCanvas: (_: WebGLRenderingContext) => {},
                    initContext: (_: HTMLCanvasElement) => {},
                }
            }
        };

        libraryInterface.params.systems
            .forEach(system => {
                const configuration = getDefault(system.configuration, defaultWebGLHooksConfiguration);
                const selectedHook = configuration.renderer.webgl[hookType];
                retValue = selectedHook.call(this, ...params);
            });

        // Last particle system's configuration gets the initialization priority
        return retValue;
    }

}