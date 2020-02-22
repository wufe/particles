import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem } from "../models/particle-system";
import { IParticle, Particle, ParticleDirection } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { LiquidParticleWrapper } from "./liquid/liquid-particle-wrapper";

export interface ILiquidParticleSystemParams {
    particles: {
        background: {
            count: number;
        }
    }
}

export class LiquidParticleSystemBuilder {

    public static build(params: ILiquidParticleSystemParams) {
        return class extends BaseParticleSystem implements IParticleSystem {

            private _particles: LiquidParticleWrapper[] = [];

            attach() {
                const { width, height, depth } = this.manager.configuration;
                const zSection = depth / 6;
                const startZ = zSection * -1;

                this._particles = new Array(params.particles.background.count)
                    .fill(null)
                    .map(_ => {
                        const x = Math.random() * width;
                        const y = Math.random() * height;
                        const z = depth / 2;
                        const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                        particle.size = 5 + Math.random() * 10;
                        particle.color.w = Math.random() / 3 + .1;
                        particle.setVelocity(ParticleDirection.UP, {
                            randomize: true,
                            boundary: {
                                min: .2,
                                max: 2
                            }
                        })
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            getParticles() {
                return this._particles.map(x => x.particle);;
            }

            tick() {
                this._particles
                    .forEach(x => x.particle.updatePosition());
            }
        }
    }

}