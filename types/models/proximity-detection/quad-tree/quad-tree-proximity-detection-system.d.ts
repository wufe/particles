import { IProximityDetectionSystem } from "../proximity-detection-system";
import { IParticle } from "../../particle";
import { QuadTree } from "./quad-tree";
import { ILibraryInterface } from "../../../main";
export declare class QuadTreeProximityDetectionSystem implements IProximityDetectionSystem {
    private _manager;
    constructor(_manager: ILibraryInterface);
    quadTree: QuadTree | null;
    init(): void;
    update(objects: IParticle[]): void;
    getNeighbours(object: IParticle, radius?: number): IParticle[];
    private _getDistance;
}
