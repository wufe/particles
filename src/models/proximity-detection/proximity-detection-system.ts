import { IParticle } from "../particle";
import { ILibraryInterface } from "../../library-interface";

export interface IProximityDetectionSystemBuilder {
    new(manager: ILibraryInterface, ...args: any[]): IProximityDetectionSystem;
}

export interface IProximityDetectionSystem {
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(object: IParticle, radius?: number): IParticle[];
}