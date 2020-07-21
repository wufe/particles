import { IParticle } from "./particle";
import { Unit } from "../utils/units";
import { ILibraryInterface } from "../library-interface";
export declare type TParticleSystemBuilder = {
    build(manager: ILibraryInterface): IParticleSystem;
};
export declare enum ParticleSystemRequiredFeature {
    LINKS = "links",
    PROXIMITY_DETECTION = "proximityDetection",
    TRANSITIONS = "transitions"
}
export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
    requirements: ParticleSystemRequiredFeature[];
}
export declare type TSystemLinksConfiguration = {
    required: boolean;
    distance?: number;
    unit?: Unit;
};
