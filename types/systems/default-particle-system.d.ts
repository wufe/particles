import { IParticleSystem } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { BaseParticleSystem } from "./base-particle-system";
export declare class DefaultParticleSystem extends BaseParticleSystem implements IParticleSystem {
    private _particles;
    attach(): void;
    tick(delta: number, time: number): void;
    getParticles(): IParticle[];
}
