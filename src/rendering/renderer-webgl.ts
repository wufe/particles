import { PluginAdapter, HookType } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
import { ILibraryInterface } from "../main";
import { IVector4D } from "../models/vector4d";
import { ParticlesProgram, UpdateableParam } from "../webgl/programs/webgl-particles-program";
import { ViewBox } from "../webgl/camera/view-box";
import { CameraEvents } from "../webgl/camera/camera-events";
import { ParticlesSectorsProgram } from "../webgl/programs/webgl-particles-sectors-program";

export type TWebGLConfiguration = {
    backgroundColor: number[];
    camera: {
        enabled: boolean;
        pitch  : number;
        yaw    : number;
        zoom   : number;
        ortho  : boolean;
        fov    : number;
    };
    viewBox: ViewBox | null;
    programs: {
        particles   : ParticlesProgram | null;
        sectors     : ParticlesSectorsProgram | null;
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
    }

    private _initRenderer(libraryInterface: IWebGLLibraryInterface) {
        
        const [r, g, b, a] = libraryInterface.params.backgroundColor;
        const backgroundColor = getColor(r, g, b, a);

        const { enabled, pitch, yaw, zoom, ortho, fov } = libraryInterface.params.camera;
        
        const webglConfiguration: TWebGLConfiguration = {
            backgroundColor,
            programs: {
                particles   : null,
                sectors     : null,
            },
            viewBox: null,
            camera: {
                enabled,
                pitch,
                yaw,
                zoom,
                ortho,
                fov,
            }
        };
        libraryInterface.configuration.webgl = webglConfiguration;
    }

    private _initContext(libraryInterface: IWebGLLibraryInterface) {
        const context = libraryInterface.canvas.getContext('webgl');
        libraryInterface.context = context;

    }

    private _initCanvas(libraryInterface: IWebGLLibraryInterface) {
        const { width, height } = libraryInterface.configuration;
        const context = libraryInterface.context;
        context.viewport(0, 0, width, height);

        context.blendFunc(context.SRC_ALPHA, context.ONE);
        context.enable(context.BLEND);
        // context.enable(context.DEPTH_TEST);
		context.enable(context.CULL_FACE);
		context.cullFace(context.BACK);
        context.frontFace(context.CW);
    }

    private _preStart(libraryInterface: IWebGLLibraryInterface) {
        const { width, height, depth } = libraryInterface.configuration;
        const context = libraryInterface.context;

        // #region ViewBox
        const viewBox = new ViewBox(libraryInterface);
        libraryInterface.configuration.webgl.viewBox = viewBox;
        // #endregion

        // #region CameraEvents
        const canvas = libraryInterface.canvas;
        const cameraEvents = new CameraEvents(libraryInterface);
        cameraEvents.bind(canvas);
        cameraEvents.onChange = this._onCameraChange.bind(this)(libraryInterface);
        // #endregion

        // #region Sectors program
        const particlesSectorsProgram = new ParticlesSectorsProgram(context, viewBox, libraryInterface);
        particlesSectorsProgram.init(libraryInterface.particlesSectorManager);
        libraryInterface.configuration.webgl.programs.sectors = particlesSectorsProgram;
        // #endregion

        // #region Particles program
        const particlesProgram = new ParticlesProgram(context, viewBox, libraryInterface);
        const particles = libraryInterface.getAllParticles();
        particlesProgram.init(particles);
        
        libraryInterface.configuration.webgl.programs.particles = particlesProgram;
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
        libraryInterface.configuration.webgl.programs.sectors.draw();
        libraryInterface.configuration.webgl.programs.particles.draw();
    }

    private _update(libraryInterface: IWebGLLibraryInterface) {
        libraryInterface.configuration.webgl.programs.sectors.update(libraryInterface.deltaTime, libraryInterface.time);
        libraryInterface.configuration.webgl.programs.particles.update(libraryInterface.deltaTime, libraryInterface.time);
    }

    private _onCameraChange(libraryInterface: IWebGLLibraryInterface) {
        return () => {
            libraryInterface.configuration.webgl.viewBox.recalculate();
            libraryInterface.configuration.webgl.programs.sectors.notifyParamChange(UpdateableParam.CAMERA);
            libraryInterface.configuration.webgl.programs.particles.notifyParamChange(UpdateableParam.CAMERA);
        };
    }

    private _onSystemUpdated(libraryInterface: IWebGLLibraryInterface) {
        const particles = libraryInterface.getAllParticles();
        libraryInterface.configuration.webgl.programs.particles.useParticles(particles);
    }

}