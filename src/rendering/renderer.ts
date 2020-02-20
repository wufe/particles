import { PluginAdapter } from "../plugin/plugin-adapter";
import { IDrawingInterface } from "../drawing/drawing-interface";
import { IParticle } from "../models/particle";
import { IParticleSystem } from "../models/particle-system";

export interface IRendererBuilder {
    new(pluginAdapter: PluginAdapter): IRenderer;
}

export interface IRenderer {
    register: () => void;
}