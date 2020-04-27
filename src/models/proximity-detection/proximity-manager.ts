import { IProximityDetectionSystem } from "./proximity-detection-system";
import { IParticle } from "../particle";
import { performanceMetricsHelper } from "../../utils/performance-metrics";

export class ProximityManager {

    private _system: IProximityDetectionSystem;
    private _objects: IParticle[] = [];
    private _stepMod = 0;
    
    setProximityDetectionSystem(system: IProximityDetectionSystem) {
        this._system = system;
    }

    feedProximityDetectionSystem(objects: IParticle[]) {
        this._objects = objects;
        this._system.update(objects);
    }

    update() {
        let step = 10;
        const objectsLength = this._objects.length;

        const start = performance.now();
        if (objectsLength) {
            if (step > objectsLength)
                step = objectsLength;

            const stepLength = Math.floor(objectsLength / step);
            const startIndex = stepLength * this._stepMod;
            const endIndex = this._stepMod === (step - 1) ? objectsLength : (startIndex + stepLength);

            for (let i = startIndex; i < endIndex; i++) {
                const particle = this._objects[i];
                particle.setNeighbours(this._system.getNeighbours(particle, particle.proximity));
            }

            this._stepMod = ((this._stepMod + 1) % step);
        }

        const end = performance.now();
        performanceMetricsHelper.set('neighbours step', Math.round(end-start))
        
    }

}