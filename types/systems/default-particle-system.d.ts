import { IParticleSystem, TParticleSystemBuilder } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { BaseParticleSystem } from "./base-particle-system";
import { Unit } from "../utils/units";
import { RecursivePartial } from "../utils/object-utils";
import { TRandomizedValueOptions } from "../utils/random";
import { ILibraryInterface } from "../library-interface";
declare type TDefaultParticleSystemParams = {
    color: number[];
    count: TRandomizedValueOptions;
    size: TRandomizedValueOptions;
    proximity: {
        value: number;
        unit: Unit;
    };
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
