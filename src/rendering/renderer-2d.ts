import { PluginAdapter, HookType } from "../plugin/plugin-adapter";
import { IDrawingInterface } from "../drawing/drawing-interface";
import { IRenderer } from "./renderer";
import { IParticleSystem } from "../models/particle-system";

export class Renderer2D implements IRenderer {
    constructor() {}

    register(pluginAdapter: PluginAdapter) {
        pluginAdapter.addAfter(HookType.CONTEXT_INIT, this._initContext);
        pluginAdapter.addAfter(HookType.DRAW, this._draw);
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