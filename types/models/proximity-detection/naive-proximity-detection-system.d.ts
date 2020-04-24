import { IProximityDetectionSystem } from "./proximity-detection-system";
import { ILibraryInterface } from "../../main";
import { RecursivePartial } from "../../utils/object-utils";
import { IParticle } from "../particle";
export declare type TNativeProximityDetectionSystemParams = {
    radius: number;
};
export declare class NaiveProximityDetectionSystem implements IProximityDetectionSystem {
    private manager;
    static params: TNativeProximityDetectionSystemParams;
    private _objects;
    constructor(manager: ILibraryInterface);
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(a: IParticle, radius?: number): IParticle[];
    private getDistance;
}
export declare class NaiveProximityDetectionSystemBuilder {
    static build(optionalParams?: RecursivePartial<TNativeProximityDetectionSystemParams>): typeof NaiveProximityDetectionSystem;
}
