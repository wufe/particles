import { IParticle } from "../../models/particle";
import { ParticleEventType } from "../../models/base-particle";
import { ILibraryInterface } from "../../main";

export class LiquidParticleWrapper {
    constructor(public particle: IParticle, private _manager: ILibraryInterface) {
        particle
            .on(ParticleEventType.POSITION_UPDATE, this.onParticlePositionUpdate);
    }

    onParticlePositionUpdate = () => {
        const { width, height, depth } = this._manager.configuration;
        if (this.particle.coords.z > depth + 100) {
            this.particle.coords.z = 0;
        }
        if (this.particle.coords.y > height + 100) {
            this.particle.coords.y = 0;
        }

    }

}