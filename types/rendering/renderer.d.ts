import { PluginAdapter } from "../plugin/plugin-adapter";
export declare type TRendererBuilder = {
    build(pluginAdapter: PluginAdapter): IRenderer;
};
export interface IRenderer {
    register: () => void;
}
