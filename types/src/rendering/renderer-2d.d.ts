import { PluginAdapter } from "../plugin/plugin-adapter";
import { IRenderer } from "./renderer";
export declare class Renderer2D implements IRenderer {
    constructor();
    register(pluginAdapter: PluginAdapter): void;
    private _initContext;
    private _draw;
}
