import { ILibraryInterface } from "../main";
import { IParticle } from "./particle";

export interface IProximityDetectionSystemBuilder {
    new(manager: ILibraryInterface): IProximityDetectionSystem;
}

export interface IProximityDetectionSystem {
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(object: IParticle, radius?: number | (() => number)): IParticle[];
}