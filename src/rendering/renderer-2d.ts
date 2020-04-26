import { PluginAdapter, HookType } from "../plugin/plugin-adapter";
import { IDrawingInterface } from "../drawing/drawing-interface";
import { IRenderer, TRendererBuilder } from "./renderer";
import { IParticleSystem } from "../models/particle-system";

export class Renderer2DBuilder {
    static build = (): TRendererBuilder => ({
        build: (pluginAdapter: PluginAdapter) => new Renderer2D(pluginAdapter)
    })
}

class Renderer2D implements IRenderer {
    constructor(private _pluginAdapter: PluginAdapter) {}

    register() {
        this._pluginAdapter.addAfter(HookType.CONTEXT_INIT, this._initContext);
        this._pluginAdapter.addAfter(HookType.DRAW, this._draw);
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