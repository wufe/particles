import { PluginAdapter } from "../plugin/plugin-adapter";
export interface IRendererBuilder {
    new (pluginAdapter: PluginAdapter): IRenderer;
}
export interface IRenderer {
    register: () => void;
}
