import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem } from "../models/particle-system";
import { IParticle, Particle } from "../models/particle";
import { Vector3D } from "../models/vector3d";

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

            private _particles: IParticle[] = [];

            attach() {
                const { width, height } = this.manager.configuration;

                this._particles = new Array(params.particles.background.count)
                    .fill(null)
                    .map(_ => {
                        const x = Math.random() * 500 - 250;
                        const y = Math.random() * 500 - 250;
                        const z = 0;
                        const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                        particle.size = 20 + Math.random() * 30;
                        particle.color.w = Math.random() / 2 + .5;
                        return particle;
                    });
            }

            getParticles() {
                return this._particles;
            }
        }
    }

}