import { IProximityDetectionSystem } from "./proximity-detection-system";
import { ILibraryInterface } from "../../main";
import { RecursivePartial, getDefault } from "../../utils/object-utils";
import { IParticle } from "../particle";

export type TNativeProximityDetectionSystemParams = {
    radius: number;
}

export class NaiveProximityDetectionSystem implements IProximityDetectionSystem {

    static params: TNativeProximityDetectionSystemParams;

    private _objects: IParticle[] = [];

    constructor(private manager: ILibraryInterface) {}

    init(): void {}

    update(objects: IParticle[]): void {
        this._objects = objects;
    }

    getNeighbours(a: IParticle, radius = NaiveProximityDetectionSystem.params.radius) {
        return this._objects
            .filter(b =>
                a !== b && this.getDistance(a, b) < radius);
    }

    private getDistance(obj1: IParticle, obj2: IParticle) {
        return Math.hypot(
            obj2.coords.x - obj1.coords.x,
            obj2.coords.y - obj1.coords.y,
            obj2.coords.z - obj1.coords.z,
        );
    }
}

export class NaiveProximityDetectionSystemBuilder {
    static build(optionalParams?: RecursivePartial<TNativeProximityDetectionSystemParams>) {
        const params = getDefault<TNativeProximityDetectionSystemParams>(optionalParams, {
            radius: 300
        });
        NaiveProximityDetectionSystem.params = params;
        return NaiveProximityDetectionSystem;
    }
}