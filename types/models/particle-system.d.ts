import { IParticle } from "./particle";
import { ILibraryInterface } from "../main";
import { Unit } from "../utils/units";
export declare type TParticleSystemBuilder = {
    build(manager: ILibraryInterface): IParticleSystem;
};
export interface IParticleSystem {
    attach(): void;
    getParticles(): IParticle[];
    tick?: (deltaT: number, T: number) => void;
    links: TSystemLinksConfiguration;
}
export declare type TSystemLinksConfiguration = {
    required: boolean;
    distance?: number;
    unit?: Unit;
};
