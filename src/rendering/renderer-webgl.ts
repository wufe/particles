import { PluginAdapter, HookType } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
import { ILibraryInterface } from "../main";
import { IVector4D } from "../models/vector4d";
import { ParticlesProgram, UpdateableParam } from "../webgl/programs/webgl-particles-program";
import { ViewBox } from "../webgl/camera/view-box";
import { CameraEvents } from "../webgl/camera/camera-events";
import { ParticlesSectorsProgram } from "../webgl/programs/webgl-particles-sectors-program";

export interface IWebGLInternals {
    backgroundColor: number[];
    programs: {
        particles   : ParticlesProgram | null;
        sectors     : ParticlesSectorsProgram | null;
    }
}

export interface IWebGLLibraryInterface extends ILibraryInterface {
    context: WebGLRenderingContext;
    internals: ILibraryInterface['internals'] & {
        webgl: IWebGLInternals;
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
        
        const webglInternals: IWebGLInternals = {
            backgroundColor,
            programs: {
                particles   : null,
                sectors     : null,
            }
        };
        libraryInterface.internals.webgl = webglInternals;
    }

    private _initContext(libraryInterface: IWebGLLibraryInterface) {
        const context = libraryInterface.canvas.getContext('webgl');
        libraryInterface.context = context;

    }

    private _initCanvas(libraryInterface: IWebGLLibraryInterface) {
        const { width, height } = libraryInterface.internals;
        const context = libraryInterface.context;
        context.viewport(0, 0, width, height);

        context.blendFunc(context.SRC_ALPHA, context.ONE);
        context.enable(context.BLEND);
        context.enable(context.DEPTH_TEST);
		context.enable(context.CULL_FACE);
		context.cullFace(context.BACK);
        context.frontFace(context.CW);
    }

    private _preStart(libraryInterface: IWebGLLibraryInterface) {
        const { width, height } = libraryInterface.internals;
        const context = libraryInterface.context;

        // #region ViewBox
        const { enabled, pitch, yaw } = libraryInterface.params.camera;
        const viewBox = new ViewBox(width, height, pitch, yaw, enabled);
        // #endregion

        // #region CameraEvents
        const canvas = libraryInterface.canvas;
        const cameraEvents = new CameraEvents(context, viewBox);
        cameraEvents.bind(canvas);
        cameraEvents.onChange = this._onCameraChange.bind(this)(libraryInterface);
        // #endregion

        // #region Sectors program
        const particlesSectorsProgram = new ParticlesSectorsProgram(context, viewBox, libraryInterface);
        particlesSectorsProgram.init(libraryInterface.particlesSectorManager);
        libraryInterface.internals.webgl.programs.sectors = particlesSectorsProgram;
        // #endregion

        // #region Particles program
        const particlesProgram = new ParticlesProgram(context, viewBox, libraryInterface);
        const particles = libraryInterface.getAllParticles();
        particlesProgram.init(particles);
        
        libraryInterface.internals.webgl.programs.particles = particlesProgram;
        // #endregion

        // #region Particles change events
        this._pluginAdapter.addAfter(HookType.SYSTEM_UPDATED, this._onSystemUpdated.bind(this));
        // #endregion
    }

    private _clearCanvas(libraryInterface: IWebGLLibraryInterface) {
        const webglInternals = libraryInterface.internals.webgl;
        const context = libraryInterface.context;
        const [r, g, b, a] = webglInternals.backgroundColor;
        context.clearColor(r, g, b, a);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }

    private _draw(libraryInterface: IWebGLLibraryInterface) {
        libraryInterface.internals.webgl.programs.sectors.draw();
        libraryInterface.internals.webgl.programs.particles.draw();
    }

    private _update(libraryInterface: IWebGLLibraryInterface) {
        libraryInterface.internals.webgl.programs.sectors.update(libraryInterface.deltaTime, libraryInterface.time);
        libraryInterface.internals.webgl.programs.particles.update(libraryInterface.deltaTime, libraryInterface.time);
    }

    private _onCameraChange(libraryInterface: IWebGLLibraryInterface) {
        return () => {
            libraryInterface.internals.webgl.programs.sectors.notifyParamChange(UpdateableParam.CAMERA);
            libraryInterface.internals.webgl.programs.particles.notifyParamChange(UpdateableParam.CAMERA);
        };
    }

    private _onSystemUpdated(libraryInterface: IWebGLLibraryInterface) {
        const particles = libraryInterface.getAllParticles();
        libraryInterface.internals.webgl.programs.particles.useParticles(particles);
    }

}