import { IParticleSystem } from "../models/particle-system";
import { ILibraryInterface } from "../main";
import { IParticle, Particle } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { SystemBridgeEventNotification } from "../drawing/system-bridge";
import { ParticleSectorManager } from "../models/particle-sector-manager";

export class DefaultParticleSystem implements IParticleSystem {

    private _manager: ILibraryInterface;
    private _particles: IParticle[] = [];

    attach(manager: ILibraryInterface) {
        const { width, height } = manager.internals;
        const sectionLength = Math.min(width, height) / 10;
        this._manager = manager;

        this._particles = new Array(5000)
            .fill(null)
            .map(_ => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * Math.min(width, height);
                const particle = new Particle(new Vector3D({ x, y, z }));
                const sectorX = Math.floor(x / sectionLength);
                const sectorY = Math.floor(y / sectionLength);
                const sectorZ = Math.floor(z / sectionLength);
                particle.sector = manager.particlesSectorManager.getSectorByIndex(sectorX, sectorY, sectorZ);
                return particle;
            });
    }

    notifyChange() {
        if (this._manager)
            this._manager.notify(SystemBridgeEventNotification.CHANGE, this);
    }

    getParticles() {
        return this._particles;
    }
}