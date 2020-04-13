import { IParticle } from "./particle";
import { ILibraryInterface } from "../main";
import { RecursivePartial } from "../utils/object-utils";
export declare type TParticleSystemConfiguration = {
    renderer: {
        [renderer: string]: TRendererHooksConfiguration;
    };
};
export declare enum RendererHook {
    INIT_CONTEXT = "initContext",
    INIT_CANVAS = "initCanvas"
}
export declare type TRendererHooksConfiguration = {
    [h in RendererHook]: TRendererHook<any>;
};
export declare type TRendererHook<T> = (p: T) => any;
export declare type TRendererContextHook<T extends RenderingContext = RenderingContext> = TRendererHook<T>;
export declare type TRendererCanvasHook = TRendererHook<HTMLCanvasElement>;
export declare type TWebGLRendererHooksConfiguration = TRendererHooksConfiguration & {
    [RendererHook.INIT_CONTEXT]: TRendererContextHook<WebGLRenderingContext>;
    [RendererHook.INIT_CANVAS]: TRendererCanvasHook;
};
export interface IParticleSystemBuilder {
    new (manager: ILibraryInterface): IParticleSystem;
    configuration?: RecursivePartial<TParticleSystemConfiguration>;
}
export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
}
