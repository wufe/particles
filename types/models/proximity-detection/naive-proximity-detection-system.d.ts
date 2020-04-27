import { IProximityDetectionSystem, TProximityDetectionSystemBuilder } from "./proximity-detection-system";
import { RecursivePartial } from "../../utils/object-utils";
import { IParticle } from "../particle";
import { ILibraryInterface } from "../../library-interface";
export declare type TNativeProximityDetectionSystemParams = {
    radius: number;
};
export declare class NaiveProximityDetectionSystemBuilder {
    static build: (optionalParams?: RecursivePartial<TNativeProximityDetectionSystemParams>) => TProximityDetectionSystemBuilder;
}
export declare class NaiveProximityDetectionSystem implements IProximityDetectionSystem {
    private manager;
    private _params;
    private _objects;
    constructor(manager: ILibraryInterface, _params: TNativeProximityDetectionSystemParams);
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(a: IParticle, radius?: number): IParticle[];
    private getDistance;
}
