import { TRandomizedValueOptions } from "../../utils/random";
import { LiquidParticleWrapper } from "./liquid-particle-wrapper";
import { ILibraryInterface } from "../../main";
import { BaseParticleSystem } from "../base-particle-system";
export declare type TLiquidParticlesCollectionParameters = {
    width: number;
    height: number;
    depth: number;
} & TLiquidParticleSystemSquirt;
export declare type TLiquidParticleSystemSquirt = {
    count: number;
    opacity: TRandomizedValueOptions;
    size: TRandomizedValueOptions;
    spawnTimePerParticle: TRandomizedValueOptions;
    transitionDuration: TRandomizedValueOptions;
    from: (width: number, height: number, depth: number) => TRandomizedVector;
    to: (width: number, height: number, depth: number) => TRandomizedVector;
};
export declare type TRandomizedVector = {
    x: TRandomizedValueOptions;
    y: TRandomizedValueOptions;
    z: TRandomizedValueOptions;
};
export declare class LiquidParticlesCollection {
    private _system;
    private _particles;
    constructor(_system: BaseParticleSystem);
    getParticles(): LiquidParticleWrapper[];
    build(parameters: TLiquidParticlesCollectionParameters, manager: ILibraryInterface): this;
    private _setupParticlePositionTransition;
    private _calculateSquirtTimespan;
}
