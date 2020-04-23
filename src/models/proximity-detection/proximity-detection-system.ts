import { ILibraryInterface } from "../../main";
import { IParticle } from "../particle";

export interface IProximityDetectionSystemBuilder {
    new(manager: ILibraryInterface, ...args: any[]): IProximityDetectionSystem;
}

export interface IProximityDetectionSystem {
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(object: IParticle, radius?: number): IParticle[];
}