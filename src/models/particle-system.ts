import { IParticle } from "./particle";
import { ISystemBridge } from "../drawing/system-bridge";
import { ILibraryInterface } from "../main";

export interface IParticleSystemBuilder {
    new(manager: ILibraryInterface): IParticleSystem;
}

export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
}