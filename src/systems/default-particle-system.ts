import { IParticleSystem } from "../models/particle-system";
import { ILibraryInterface } from "../main";
import { IParticle, Particle } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { SystemBridgeEventNotification, ISystemBridge } from "../drawing/system-bridge";
import { ParticleSectorManager } from "../models/particle-sector-manager";
import { BaseParticleSystem } from "./base-particle-system";

export class DefaultParticleSystem extends BaseParticleSystem implements IParticleSystem {

    private _particles: IParticle[] = [];

    attach() {
        const { width, height } = this.manager.internals;
        const sectionLength = Math.min(width, height) / 10;

        this._particles = new Array(100)
            .fill(null)
            .map(_ => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * Math.min(width, height);
                const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                const sectorX = Math.floor(x / sectionLength);
                const sectorY = Math.floor(y / sectionLength);
                const sectorZ = Math.floor(z / sectionLength);
                particle.sector = this.manager.particlesSectorManager.getSectorByIndex(sectorX, sectorY, sectorZ);
                return particle;
            });
    }

    tick(deltaT: number, T: number) {
        this._particles
            .forEach(p => {
                p.updatePosition();
            })
    }

    getParticles() {
        return this._particles;
    }
}