import { IParticle } from "./particle";
import { ISystemBridge } from "../drawing/system-bridge";
import { ILibraryInterface } from "../main";
import { RecursivePartial } from "../utils/object-utils";
import { Unit } from "../utils/units";


export type TParticleSystemConfiguration = {
    renderer: {
        [renderer: string]: TRendererHooksConfiguration;
    }
}

export enum RendererHook {
    INIT_CONTEXT = 'initContext',
    INIT_CANVAS = 'initCanvas',
}

export type TRendererHooksConfiguration = {
    [h in RendererHook]: TRendererHook<any>;
}

export type TRendererHook<T> = (p: T) => any;

export type TRendererContextHook<T extends RenderingContext = RenderingContext> = TRendererHook<T>;
export type TRendererCanvasHook = TRendererHook<HTMLCanvasElement>;

export type TWebGLRendererHooksConfiguration = TRendererHooksConfiguration & {
    [RendererHook.INIT_CONTEXT]: TRendererContextHook<WebGLRenderingContext>;
    [RendererHook.INIT_CANVAS]: TRendererCanvasHook;
};

export interface IParticleSystemBuilder {
    new(manager: ILibraryInterface): IParticleSystem;
    configuration?: RecursivePartial<TParticleSystemConfiguration>;
}

export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
    links: SystemLinksConfiguration;
}

export type SystemLinksConfiguration = {
    required:  boolean;
    distance?: number;
    unit    ?: Unit;
}