import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem, IParticleSystemBuilder, TParticleSystemConfiguration, RendererHook } from "../models/particle-system";
import { IParticle, Particle, ParticleDirection, TRandomizeOptions } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { LiquidParticleWrapper } from "./liquid/liquid-particle-wrapper";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { TransitionEasingFunction } from "./transition/transition-specification";
import { ParticleEventType } from "../models/base-particle";
import { Vector4D } from "../models/vector4d";

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
            count: 200
        },
        background: {
            count: 20
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

                const firstSquirtParticles = this._buildFirstSquirtParticles();
                const secondSquirtParticles = this._buildSecondSquirtParticles();

                this._particles = environmentalParticles
                    .concat(backgroundParticles)
                    .concat(firstSquirtParticles)
                    .concat(secondSquirtParticles);
            }

            // TODO: Move to "utils" file, with TRandomizeOptions
            private _randomValueFromBoundary(boundary: TRandomizeOptions['boundary']) {
                const { min, max } = boundary;
                const range = max - min;
                return Math.random() * range + min;
            }

            private _setupParticlePositionTransition(particle: Particle, heightRandomizeOptions: TRandomizeOptions, durationRandomizeOptions: TRandomizeOptions) {
                const { width, height, depth } = this.manager.configuration;

                const x = Math.random() * width;
                const y = heightRandomizeOptions.randomize ? this._randomValueFromBoundary(heightRandomizeOptions.boundary) : 0;
                const z = Math.random() * depth;
                particle
                    .useTransition()
                    .from(new Vector3D({ x, z, y }))
                    .to(new Vector3D({ x, z, y: height }))
                    .in(this._randomValueFromBoundary(durationRandomizeOptions.boundary))
                    .easing(TransitionEasingFunction.LINEAR)
                    .then(() => {
                        this._setupParticlePositionTransition(particle, { randomize: false }, durationRandomizeOptions);
                    })
                    .commit();
            }

            private _buildEnvironmentalParticles(): LiquidParticleWrapper[] {
                const { height } = this.manager.configuration;
                return new Array(params.particles.environment.count)
                    .fill(null)
                    .map(_ => {
                        const particle = new Particle(new Vector3D({ x: 0, y: 0, z: 0 }), this.manager);
                        particle.setSize({ min: 1, max: 10 });
                        particle.color.w = Math.random() / 2 + .2;
                        this._setupParticlePositionTransition(particle,
                            {
                                randomize: true,
                                boundary: {
                                    min: 0,
                                    max: height
                                }
                            }, {
                                randomize: true,
                                boundary: {
                                    min: 20000,
                                    max: 80000
                                }
                        });
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            private _buildBackgroundParticles(): LiquidParticleWrapper[] {
                const { height } = this.manager.configuration;

                return new Array(params.particles.background.count)
                    .fill(null)
                    .map(_ => {
                        const particle = new Particle(new Vector3D({ x: 0, y: 0, z: 0 }), this.manager);
                        particle.setSize({ min: 50, max: 100 });
                        particle.color.w = Math.random() / 5 + .1;
                        this._setupParticlePositionTransition(particle,
                            {
                                randomize: true,
                                boundary: {
                                    min: 0,
                                    max: height
                                }
                            }, {
                                randomize: true,
                                boundary: {
                                    min: 40000,
                                    max: 100000
                                }
                        });
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            private _buildFirstSquirtParticles(): LiquidParticleWrapper[] {
                const { width, height, depth } = this.manager.configuration;

                const squirtParticles = 1000;
                const squirtSpawnTimePerParticle = 50;
                const squirtSpawnTimeRandomness = .5;

                return new Array(squirtParticles)
                    .fill(null)
                    .map((_, i) => {
                        const particle = new Particle(new Vector3D({ x: 0, y: 0, z: 0 }), this.manager);
                        particle.setSize({ min: 1, max: 10 });
                        particle.color.x = 255;
                        particle.color.w = this._randomValueFromBoundary({ min: .2, max: .8 });
                        particle
                            .useTransition()
                            .within(this._randomValueFromBoundary({
                                min: i * squirtSpawnTimePerParticle - squirtSpawnTimePerParticle * squirtSpawnTimeRandomness,
                                max: i * squirtSpawnTimePerParticle + squirtSpawnTimePerParticle * squirtSpawnTimeRandomness
                            }))
                            .from({
                                x: width * .2,
                                y: 0,
                                z: depth / 2
                            })
                            .to({
                                x: this._randomValueFromBoundary({
                                    min: width * .25,
                                    max: width * .5
                                }),
                                y: height,
                                z: this._randomValueFromBoundary({
                                    min: depth * .3,
                                    max: depth * .7
                                })
                            })
                            .in(this._randomValueFromBoundary({ min: 10000, max: 20000 }))
                            .commit();
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            private _buildSecondSquirtParticles(): LiquidParticleWrapper[] {
                const { width, height, depth } = this.manager.configuration;

                const squirtParticles = 200;
                const squirtSpawnTimePerParticle = 600;
                const squirtSpawnTimeRandomness = .8;

                return new Array(squirtParticles)
                    .fill(null)
                    .map((_, i) => {
                        const particle = new Particle(new Vector3D({ x: 0, y: 0, z: 0 }), this.manager);
                        particle.setSize({ min: 1, max: 10 });
                        particle.color.x = 255;
                        particle.color.w = this._randomValueFromBoundary({ min: .2, max: .86 });
                        particle
                            .useTransition()
                            .within(this._randomValueFromBoundary({
                                min: i * squirtSpawnTimePerParticle - squirtSpawnTimePerParticle * squirtSpawnTimeRandomness,
                                max: i * squirtSpawnTimePerParticle + squirtSpawnTimePerParticle * squirtSpawnTimeRandomness
                            }))
                            .from({
                                x: width * .8,
                                y: 0,
                                z: depth / 2
                            })
                            .to({
                                x: this._randomValueFromBoundary({
                                    min: width * .5,
                                    max: width * .75
                                }),
                                y: height,
                                z: this._randomValueFromBoundary({
                                    min: depth * .3,
                                    max: depth * .7
                                })
                            })
                            .in(this._randomValueFromBoundary({ min: 40000, max: 90000 }))
                            .commit();
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            getParticles() {
                return this._particles.map(x => x.particle);;
            }

            tick(delta: number, time: number) {
                this._particles
                    .forEach(x => x.particle.update(delta, time));
            }
        }
    }
}