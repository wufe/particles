import { IProximityDetectionSystem } from "./proximity-detection-system";
import { IParticle } from "../particle";
export declare class ProximityManager {
    private _system;
    private _objects;
    private _stepMod;
    setProximityDetectionSystem(system: IProximityDetectionSystem): void;
    feedProximityDetectionSystem(objects: IParticle[]): void;
    update(step: number): void;
}
