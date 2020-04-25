import { IParticle } from "./particle";
import { ISystemBridge } from "../drawing/system-bridge";
import { ILibraryInterface } from "../main";
import { RecursivePartial } from "../utils/object-utils";
import { Unit } from "../utils/units";

export type TParticleSystemBuilder = {
    build(manager: ILibraryInterface): IParticleSystem;
}

export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
    links: TSystemLinksConfiguration;
}

export type TSystemLinksConfiguration = {
    required:  boolean;
    distance?: number;
    unit    ?: Unit;
}