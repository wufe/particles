import { IDrawingInterface } from "../drawing/drawing-interface";
import { IRenderer, TRendererBuilder } from "./renderer";
import { IParticleSystem } from "../models/particle-system";
import { ILibraryInterface, LibraryInterfaceHook } from "../library-interface";

export class Renderer2DBuilder {
    static build = (): TRendererBuilder => ({
        build: libraryInterface => new Renderer2D(libraryInterface)
    })
}

class Renderer2D implements IRenderer {
    constructor(private _libraryInterface: ILibraryInterface) {}

    register() {
        this._libraryInterface.hooks[LibraryInterfaceHook.CONTEXT_INIT].subscribe(this._initContext.bind(this));
        this._libraryInterface.hooks[LibraryInterfaceHook.DRAW].subscribe(this._draw.bind(this));
    }

    private _initContext(drawingInterface: IDrawingInterface) {
        drawingInterface.context = drawingInterface.canvas.getContext('2d');
    }

    private _draw(systems: IParticleSystem[]) {
        systems.forEach(x => {
            const particles = x.getParticles();
        });
    }
}