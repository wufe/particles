import { IParticleSystem, TParticleSystemConfiguration } from "../models/particle-system";
import { ILibraryInterface } from "../main";
import { IParticle, Particle, ParticleDirection } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { BaseParticleSystem } from "./base-particle-system";
import { Vector4D } from "../models/vector4d";

export class DefaultParticleSystem extends BaseParticleSystem implements IParticleSystem {

    private _particles: IParticle[] = [];

    attach() {
        const { width, height, depth } = this.manager.configuration;

        this._particles = new Array(100)
            .fill(null)
            .map(_ => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * depth;
                const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                // particle.setColor(Math.random() * 255, Math.random() * 255, Math.random() * 255, Math.random() / 3 + .66)
                // particle.setColor(255, 255, 255, Math.random() / 3 + .66);
                particle.setColor(255, 255, 255, 1);
                particle.setSize({ randomize: true, boundary: { min: 1, max: 5 }})
                particle.setVelocity(ParticleDirection.UP, {
                    randomize: true,
                    boundary: {
                        min: -3,
                        max: 3
                    }
                });
                particle.setVelocity(ParticleDirection.RIGHT, {
                    randomize: true,
                    boundary: {
                        min: -3,
                        max: 3
                    }
                });
                particle.setVelocity(ParticleDirection.FRONT, {
                    randomize: true,
                    boundary: {
                        min: -3,
                        max: 3
                    }
                });
                return particle;
            });
    }

    tick(delta: number, time: number) {
        const { width, height, depth } = this.manager.configuration;

        this._particles
            .forEach(p => {
                p.update(delta, time);
                if (p.coords.x < 0)
                    p.coords.x = width;
                if (p.coords.x > width)
                    p.coords.x = 0;
                if (p.coords.y < 0)
                    p.coords.y = height;
                if (p.coords.y > height)
                    p.coords.y = 0;
                if (p.coords.z < 0)
                    p.coords.z = depth;
                if (p.coords.z > depth)
                    p.coords.z = 0;
            });
    }

    getParticles() {
        return this._particles;
    }
}