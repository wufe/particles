import { IParticle } from "./particle";
import { ISystemBridge } from "../drawing/system-bridge";
import { RecursivePartial } from "../utils/object-utils";
import { Unit } from "../utils/units";
import { ILibraryInterface } from "../library-interface";

export type TParticleSystemBuilder = {
    build(manager: ILibraryInterface): IParticleSystem;
}

export enum ParticleSystemRequiredFeature {
    LINKS               = 'links',
    PROXIMITY_DETECTION = 'proximityDetection',
}

export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
    requirements: ParticleSystemRequiredFeature[];
}

export type TSystemLinksConfiguration = {
    required:  boolean;
    distance?: number;
    unit    ?: Unit;
}