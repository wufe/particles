import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem, IParticleSystemBuilder, TParticleSystemConfiguration, RendererHook } from "../models/particle-system";
import { IParticle, Particle, ParticleDirection } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { LiquidParticleWrapper } from "./liquid/liquid-particle-wrapper";
import { RecursivePartial, getDefault } from "../utils/object-utils";

export interface ILiquidParticleSystemParams {
    particles: {
        environment: {
            count: number;
        };
        background: {
            count: number;
        };
    }
}

const defaultLiquidParticleSystemParams: ILiquidParticleSystemParams = {
    particles: {
        environment: {
            count: 100
        },
        background: {
            count: 10
        }
    }
}

export class LiquidParticleSystemBuilder {

    public static build(params?: RecursivePartial<ILiquidParticleSystemParams>) {

        params = getDefault(params, defaultLiquidParticleSystemParams);

        return class extends BaseParticleSystem implements IParticleSystem {

            private _particles: LiquidParticleWrapper[] = [];


            attach() {
                const environmentalParticles = this._buildEnvironmentalParticles();
                const backgroundParticles = this._buildBackgroundParticles();

                this._particles = environmentalParticles
                    .concat(backgroundParticles);
            }

            private _buildEnvironmentalParticles(): LiquidParticleWrapper[] {
                const { width, height, depth } = this.manager.configuration;

                return new Array(params.particles.environment.count)
                    .fill(null)
                    .map(_ => {
                        const x = Math.random() * width;
                        const y = Math.random() * height;
                        const z = Math.random() * depth;
                        const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                        particle.setSize({ min: 5, max: 15 });
                        particle.color.w = Math.random() / 2 + .1;
                        particle.setVelocity(ParticleDirection.UP, {
                            randomize: true,
                            boundary: {
                                min: .2,
                                max: 1
                            }
                        });
                        particle.setVelocity(ParticleDirection.RIGHT, {
                            randomize: true,
                            boundary: {
                                min: -.2,
                                max: .2
                            }
                        });
                        particle.setVelocity(ParticleDirection.FRONT, {
                            randomize: true,
                            boundary: {
                                min: -.2,
                                max: .2
                            }
                        });
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            private _buildBackgroundParticles(): LiquidParticleWrapper[] {
                const { width, height, depth } = this.manager.configuration;

                return new Array(params.particles.background.count)
                    .fill(null)
                    .map(_ => {
                        const x = Math.random() * width;
                        const y = Math.random() * height;
                        const z = Math.random() * depth;
                        const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                        particle.setSize({ min: 50, max: 100 });
                        particle.color.w = Math.random() / 5 + .05;
                        particle.setVelocity(ParticleDirection.UP, {
                            randomize: true,
                            boundary: {
                                min: .1,
                                max: .9
                            }
                        });
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            getParticles() {
                return this._particles.map(x => x.particle);;
            }

            tick() {
                this._particles
                    .forEach(x => x.particle.update());
            }

            // public static configuration: RecursivePartial<TParticleSystemConfiguration> = {
            //     renderer: {
            //         webgl: {
            //             [RendererHook.INIT_CONTEXT]: (canvas: HTMLCanvasElement) =>
            //                 canvas.getContext('webgl', { premultipliedAlpha: false })
            //         }
            //     }
            // }
        }
    }
}