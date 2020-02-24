import { IParticle } from "../../models/particle";
import { ParticleEventType } from "../../models/base-particle";
import { ILibraryInterface } from "../../main";

const BOUNDARY_MARGIN_PERCENTAGE = 10;

export class LiquidParticleWrapper {
    constructor(public particle: IParticle, private _manager: ILibraryInterface) {
        particle
            .on(ParticleEventType.POSITION_UPDATE, this.onParticlePositionUpdate);
    }

    onParticlePositionUpdate = () => {
        const { width, height, depth } = this._manager.configuration;
        let { x, y, z } = this.particle.coords;
        
        let maxDistanceFromMargin = 0;

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

        // Absolute margin distance in px
        const widthMargin = width / 100 * BOUNDARY_MARGIN_PERCENTAGE;
        const heightMargin = height / 100 * BOUNDARY_MARGIN_PERCENTAGE;
        const depthMargin = depth / 100 * BOUNDARY_MARGIN_PERCENTAGE;

        // Calculating max distance from margin, in percentage
        maxDistanceFromMargin = this._calculateDistanceFromLowerMargin(x, width, widthMargin, maxDistanceFromMargin);
        maxDistanceFromMargin = this._calculateDistanceFromUpperMargin(x, width, widthMargin, maxDistanceFromMargin);
        maxDistanceFromMargin = this._calculateDistanceFromLowerMargin(y, height, heightMargin, maxDistanceFromMargin);
        maxDistanceFromMargin = this._calculateDistanceFromUpperMargin(y, height, heightMargin, maxDistanceFromMargin);
        maxDistanceFromMargin = this._calculateDistanceFromLowerMargin(z, depth, depthMargin, maxDistanceFromMargin);
        maxDistanceFromMargin = this._calculateDistanceFromUpperMargin(z, depth, depthMargin, maxDistanceFromMargin);

        let alpha = 1;
        if (maxDistanceFromMargin) {
            // Applying the percentage of maxDistanceFromMargin relative to max margin distance
            // rounded to the 2nd decimal
            alpha = 1 - Math.floor((maxDistanceFromMargin / BOUNDARY_MARGIN_PERCENTAGE) * 100) / 100;
        }
        
        this.particle.setAlpha(alpha);

        this.particle.coords.x = x;
        this.particle.coords.y = y;
        this.particle.coords.z = z;
    }

    private _calculateDistanceFromLowerMargin(coord: number, boundary: number, margin: number, maxDistanceFromMargin: number) {
        if (coord < margin)
            maxDistanceFromMargin = Math.max(maxDistanceFromMargin, (margin - coord) / boundary * 100)
        return maxDistanceFromMargin;
    }

    private _calculateDistanceFromUpperMargin(coord: number, boundary: number, margin: number, maxDistanceFromMargin: number) {
        if (coord > boundary - margin)
            maxDistanceFromMargin = Math.max(maxDistanceFromMargin, (coord - (boundary - margin)) / boundary * 100);
        return maxDistanceFromMargin;
    }

}