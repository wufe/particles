import { IProximityDetectionSystem, TProximityDetectionSystemBuilder } from "./proximity-detection-system";
import { RecursivePartial, getDefault } from "../../utils/object-utils";
import { IParticle } from "../particle";
import { ILibraryInterface } from "../../library-interface";

export type TNativeProximityDetectionSystemParams = {
    radius: number;
}

export class NaiveProximityDetectionSystemBuilder {
    static build = (optionalParams?: RecursivePartial<TNativeProximityDetectionSystemParams>): TProximityDetectionSystemBuilder => ({
        build: manager => new NaiveProximityDetectionSystem(manager, getDefault<TNativeProximityDetectionSystemParams>(optionalParams, {
            radius: 300
        }))
    })
}

export class NaiveProximityDetectionSystem implements IProximityDetectionSystem {

    private _objects: IParticle[] = [];

    constructor(private manager: ILibraryInterface, private _params: TNativeProximityDetectionSystemParams) {}

    init(): void {}

    update(objects: IParticle[]): void {
        this._objects = objects;
    }

    getNeighbours(a: IParticle, radius = this._params.radius) {
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