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
        let { x, y, z } = this.particle.coords;

        if (y > height)
            y = 0;
        if (x > width)
            x = 0;
        if (z > depth)
            z = 0;
        if (y < 0)
            y = height;
        if (x < 0)
            x = width;
        if (z < 0)
            z = depth;

        this.particle.coords.x = x;
        this.particle.coords.y = y;
        this.particle.coords.z = z;
    }
}