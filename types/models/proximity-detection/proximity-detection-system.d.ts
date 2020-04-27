import { IParticle } from "../particle";
import { ILibraryInterface } from "../../library-interface";
export interface TProximityDetectionSystemBuilder {
    build(manager: ILibraryInterface): IProximityDetectionSystem;
}
export interface IProximityDetectionSystem {
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(object: IParticle, radius?: number): IParticle[];
}
