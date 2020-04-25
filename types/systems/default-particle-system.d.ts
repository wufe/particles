import { IParticleSystem, TParticleSystemBuilder } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { BaseParticleSystem } from "./base-particle-system";
import { RecursivePartial } from "../utils/object-utils";
import { ILibraryInterface } from "../main";
declare type TDefaultParticleSystemParams = {
    color: number[];
};
export declare class DefaultParticleSystemBuilder {
    static build: (partialParams?: RecursivePartial<TDefaultParticleSystemParams>) => TParticleSystemBuilder;
}
export declare class DefaultParticleSystem extends BaseParticleSystem implements IParticleSystem {
    private _params;
    private _particles;
    constructor(manager: ILibraryInterface, _params: TDefaultParticleSystemParams);
    attach(): void;
    tick(delta: number, time: number): void;
    getParticles(): IParticle[];
}
export {};
