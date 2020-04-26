import { PluginAdapter } from "../plugin/plugin-adapter";
import { IDrawingInterface } from "../drawing/drawing-interface";
import { IParticle } from "../models/particle";
import { IParticleSystem } from "../models/particle-system";

export type TRendererBuilder = {
    build(pluginAdapter: PluginAdapter): IRenderer;
}

export interface IRenderer {
    register: () => void;
}