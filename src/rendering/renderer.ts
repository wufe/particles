import { PluginAdapter } from "../plugin/plugin-adapter";
import { IDrawingInterface } from "../drawing/drawing-interface";
import { IParticle } from "../models/particle";
import { IParticleSystem } from "../models/particle-system";

export interface IRenderer {
    register: (pluginAdapter: PluginAdapter) => void;
}