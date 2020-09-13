import { IRenderer, TRendererBuilder } from "./renderer";
import { ParticlesProgram } from "../webgl/programs/webgl-particles-program";
import { ViewBox, IViewBox } from "../webgl/camera/view-box";
import { CameraEvents } from "../webgl/camera/camera-events";
import { BaseUniformAggregationType } from "../webgl/programs/base-webgl-program";
import { IFeature } from "../webgl/features/feature";
import { IProgram } from "../webgl/programs/webgl-program";
import { ILibraryInterface, LibraryInterfaceHook, UpdatableParams } from "../library-interface";
import { ParticleSystemRequiredFeature } from "../models/particle-system";
import { Observable, TSubscription } from "../utils/observable";
import objectPath from 'object-path';

export enum WebGLProgram {
    PARTICLES  = 'particles',
    LINES      = 'lines',
    DIRECTIONS = 'directions',
    QUADTREE   = 'quadtree',
};

export type TWebGLConfiguration = {
    backgroundColor: number[];
    camera: {
        enabled: boolean;
        locked : boolean;
        pitch  : number;
        yaw    : number;
        zoom   : {
            value: number;
            locked: boolean;
        };
        ortho  : boolean;
        fov    : number;
    };
    viewBox: IViewBox | null;
    features: { feature: IFeature, program?: IProgram }[];
    programs: {
        [WebGLProgram.PARTICLES] : ParticlesProgram | null;
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

export class RendererWebGLBuilder {
    static build = (): TRendererBuilder => ({
        build: libraryInterface => new RendererWebGL(libraryInterface)
    })
}

class RendererWebGL implements IRenderer {

    constructor(private _libraryInterface: ILibraryInterface) {}

    register() {
        this._libraryInterface.hooks[LibraryInterfaceHook.RENDERER_INIT].subscribe(this._initRenderer.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.CONTEXT_INIT].subscribe(this._initContext.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.CANVAS_INIT].subscribe(this._initCanvas.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.PRE_START].subscribe(this._preStart.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.CANVAS_CLEAR].subscribe(this._clearCanvas.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.DRAW].subscribe(this._draw.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.UPDATE].subscribe(this._update.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.WINDOW_RESIZE].subscribe(this._onResize.bind(this));
    }

    private _cameraParamsUpdatedSubscription: TSubscription<UpdatableParams['camera']>;
    private _initRenderer(libraryInterface: IWebGLLibraryInterface) {
        
        const [r, g, b, a] = libraryInterface.params.backgroundColor;
        const backgroundColor = getColor(r, g, b, a);

        const webglConfiguration: TWebGLConfiguration = {
            backgroundColor,
            programs: {
                particles: null,
            },
            features: [],
            viewBox: null
        } as TWebGLConfiguration;
        libraryInterface.configuration.webgl = webglConfiguration;

        // #region Unwanted double transition
        /**
         * Here I'm subscribing to params changing, even if there are not behavioral updates.
         * 
         * That's because the behavioral updates happens to be in camera-events.ts, where
         * the *bind* function utilizes the "libraryInterface.configuration" object instead of
         * "libraryInterface.params".
         * 
         * Thinking about the future of this library, this may be the best approach to split
         * a user-defined parameter from a software-usable configuration,
         * but right now it requires subscribing *here and there* to param changes.
         * 
         * A generic solution might be implementing a "partial subscribe", which would easen the burden
         * of raising an event in general, but not in this specific case.
         * 
         * > The partial subscribe would accept a callback and a portion of the state that the
         * > subscriber wants to be subscribed to.
         */
        const initCameraParams = () => {
            const { enabled, locked, pitch, yaw, zoom, ortho, fov } = libraryInterface.params.camera;
            
            libraryInterface.configuration.webgl.camera = {
                enabled,
                locked,
                pitch,
                yaw,
                zoom: {
                    locked: zoom.locked,
                    value: zoom.value
                },
                ortho,
                fov,
            };
        };

        initCameraParams();

        const cameraConfiguration = libraryInterface.configuration.webgl.camera;

        if (!this._cameraParamsUpdatedSubscription)
            this._cameraParamsUpdatedSubscription =
                libraryInterface.updatableParamsObservable.partialSubscribe('camera', cameraParams => {
                    cameraConfiguration.locked = libraryInterface.params.camera.locked;
                    if (cameraConfiguration.ortho !== libraryInterface.params.camera.ortho) {
                        cameraConfiguration.ortho = libraryInterface.params.camera.ortho;
                        libraryInterface.configuration.webgl.viewBox.recalculate();
                    }
                });
        // #endregion

    }

    private _initContext(libraryInterface: IWebGLLibraryInterface) {
        libraryInterface.context = libraryInterface.canvas.getContext('webgl');
    }

    private _initCanvas(libraryInterface: IWebGLLibraryInterface) {
        const { width, height } = libraryInterface.configuration;
        const context = libraryInterface.context;
        context.viewport(0, 0, width, height);

        context.enable(context.BLEND);
        context.blendEquation(context.FUNC_ADD)
        context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
        context.blendFuncSeparate(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA, context.ONE, context.ONE_MINUS_SRC_COLOR)
		context.enable(context.CULL_FACE);
		context.cullFace(context.BACK);
        context.frontFace(context.CW);
    }

    private _preStart(libraryInterface: IWebGLLibraryInterface) {
        const context = libraryInterface.context;
        const features = libraryInterface.params.features;
        const webgl = libraryInterface.configuration.webgl;

        // #region ViewBox
        const viewBox = new ViewBox(libraryInterface);
        webgl.viewBox = viewBox;
        // #endregion

        // #region Loading features
        {
            webgl.features = features
                .map(feature => ({ feature: feature.build(libraryInterface) }))
                .filter(({feature}) => feature.isAvailable());

            // Building programs per feature (if available)

            webgl.features.forEach(featureContainer => {
                const {feature} = featureContainer;
                
                if (feature.buildProgram) {
                    feature.buildProgram(context, viewBox, libraryInterface);
                    featureContainer.program = feature.getProgram();
                    if (!featureContainer.program)
                        throw new Error('The feature specifies a `buildProgram` but not a `getProgram`');
                }   
            });
        }
        // #endregion

        // #region CameraEvents
        const canvas = libraryInterface.canvas;
        const cameraEvents = new CameraEvents(libraryInterface);
        cameraEvents.bind(canvas);
        cameraEvents.onChange = this._onCameraChange.bind(this)(libraryInterface);
        // #endregion

        // const particles = libraryInterface.getAllParticles();

        // #region Particles program
        const particlesProgram = new ParticlesProgram(context, viewBox, libraryInterface);
        const useTransitions = libraryInterface.isSystemFeatureRequired(ParticleSystemRequiredFeature.TRANSITIONS);
        if (useTransitions)
            particlesProgram.withTransitions();
        particlesProgram.init();
        webgl.programs.particles = particlesProgram;
        // #endregion

        const proximityDetectionParticles = libraryInterface.getParticlesBySystemFeature(ParticleSystemRequiredFeature.PROXIMITY_DETECTION);
        libraryInterface.feedProximityDetectionSystem(proximityDetectionParticles);

        // #region Feature programs
        webgl.features.forEach(({program}) => {
            if (program)
                program.init();
        });
        // #endregion

        // #region Particles change events
        this._libraryInterface.hooks[LibraryInterfaceHook.SYSTEM_UPDATED].subscribe(this._onSystemUpdated.bind(this));
        // #endregion
    }

    private _clearCanvas(libraryInterface: IWebGLLibraryInterface) {
        const webglConfiguration = libraryInterface.configuration.webgl;
        const context = libraryInterface.context;
        const [r, g, b, a] = webglConfiguration.backgroundColor;
        context.clearColor(r, g, b, a);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }

    private _update(libraryInterface: IWebGLLibraryInterface) {
        const webgl = libraryInterface.configuration.webgl;
        const programs = webgl.programs;
        programs.particles.update(libraryInterface.deltaTime, libraryInterface.time);

        const particles = libraryInterface.getAllParticles();
        libraryInterface.feedProximityDetectionSystem(particles);

        webgl.features.forEach(({program}) => {
            if (program)
                program.update(libraryInterface.deltaTime, libraryInterface.time);
        });
    }

    private _draw(libraryInterface: IWebGLLibraryInterface) {
        const webgl = libraryInterface.configuration.webgl;
        const programs = webgl.programs;

        programs.particles.draw(libraryInterface.deltaTime, libraryInterface.time);

        webgl.features.forEach(({program}) => {
            if (program)
                program.draw(libraryInterface.deltaTime, libraryInterface.time);
        });
    }

    private _onResize(libraryInterface: IWebGLLibraryInterface) {
        const {width, height} = libraryInterface.configuration;
        const webgl = libraryInterface.configuration.webgl;
        const programs = webgl.programs;

        webgl.features.forEach(({program}) => {
            if (program)
                program.uniformChanged(BaseUniformAggregationType.RESOLUTION);
        });

        programs.particles.uniformChanged(BaseUniformAggregationType.RESOLUTION);
        this._onCameraChange(libraryInterface)();
        libraryInterface.context.viewport(0, 0, width, height);
    }

    private _onCameraChange(libraryInterface: IWebGLLibraryInterface) {
        const webgl = libraryInterface.configuration.webgl;
        return () => {
            webgl.viewBox.recalculate();

            webgl.features.forEach(({program}) => {
                if (program)
                    program.uniformChanged(BaseUniformAggregationType.CAMERA);
            });
            webgl.programs.particles.uniformChanged(BaseUniformAggregationType.CAMERA);
        };
    }

    private _onSystemUpdated(libraryInterface: IWebGLLibraryInterface) {
        const particles = libraryInterface.getAllParticles();
        libraryInterface.configuration.webgl.programs.particles.useParticles();
    }

}