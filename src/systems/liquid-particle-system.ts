import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem } from "../models/particle-system";
import { Particle } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { LiquidParticleWrapper } from "./liquid/liquid-particle-wrapper";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { TransitionEasingFunction } from "./transition/transition-specification";
import { TRandomizeOptions, randomValueFromBoundary } from "../utils/random";
import { LiquidParticlesCollection, TLiquidParticleSystemSquirt } from "./liquid/liquid-particles-collection";

export interface ILiquidParticleSystemParams {
    particles: {
        environment: {
            count: number;
        };
        background: {
            count: number;
        };
        squirts: TLiquidParticleSystemSquirt[];
    }
}

const defaultLiquidParticleSystemParams: ILiquidParticleSystemParams = {
    particles: {
        environment: {
            count: 200
        },
        background: {
            count: 20
        },
        squirts: [
            {
                count: 100,
                opacity: {
                    randomize: true,
                    boundary: {
                        min: .2,
                        max: .8
                    }
                },
                size: {
                    randomize: true,
                    boundary: {
                        min: 1,
                        max: 10
                    }
                },
                spawnTimePerParticle: {
                    randomize: true,
                    boundary: {
                        min: 25,
                        max: 75
                    }
                },
                transitionDuration: {
                    randomize: true,
                    boundary: {
                        min: 10000,
                        max: 20000
                    }
                },
                from: (w, h, d) => ({
                    x: { randomize: false, value: w * .3 },
                    y: { randomize: false, value: 0 },
                    z: { randomize: false, value: d * .5 }
                }),
                to: (w, h, d) => ({
                    x: { randomize: true, boundary: { min: w * .27, max: w * .32 } },
                    y: { randomize: false, value: h },
                    z: { randomize: true, boundary: { min: d * .3 , max: d * .7 } }
                })
            },
            {
                count: 200,
                opacity: {
                    randomize: true,
                    boundary: {
                        min: .2,
                        max: .8
                    }
                },
                size: {
                    randomize: true,
                    boundary: {
                        min: 1,
                        max: 10
                    }
                },
                spawnTimePerParticle: {
                    randomize: true,
                    boundary: {
                        min: 540,
                        max: 660
                    }
                },
                transitionDuration: {
                    randomize: true,
                    boundary: {
                        min: 80000,
                        max: 90000
                    }
                },
                from: (w, h, d) => ({
                    x: { randomize: false, value: w * .75 },
                    y: { randomize: false, value: 0 },
                    z: { randomize: false, value: d * .5 }
                }),
                to: (w, h, d) => ({
                    x: { randomize: true, boundary: { min: w * .70, max: w * .77 } },
                    y: { randomize: false, value: h },
                    z: { randomize: true, boundary: { min: d * .3 , max: d * .7 } }
                })
            }
        ]
    }
}

export class LiquidParticleSystemBuilder {

    public static build(partialParams?: RecursivePartial<ILiquidParticleSystemParams>) {

        const params = getDefault<ILiquidParticleSystemParams>(partialParams, defaultLiquidParticleSystemParams);

        return class extends BaseParticleSystem implements IParticleSystem {

            private _particles: LiquidParticleWrapper[] = [];

            attach() {
                const { width, height, depth } = this.manager.configuration;

                const environmentalParticles = this._buildEnvironmentalParticles();
                const backgroundParticles = this._buildBackgroundParticles();

                const squirts = params.particles.squirts.map(config => {
                    return new LiquidParticlesCollection(this)
                        .build({ ...config, width, height, depth }, this.manager);
                });

                this._particles = environmentalParticles
                    .concat(backgroundParticles);

                squirts.forEach(squirt => {
                    this._particles = this._particles
                        .concat(squirt.getParticles());
                });
            }

            private _setupParticlePositionTransition(particle: Particle, heightRandomizeOptions: TRandomizeOptions, durationRandomizeOptions: TRandomizeOptions) {
                const { width, height, depth } = this.manager.configuration;

                const x = Math.random() * width;
                const y = heightRandomizeOptions.randomize ? randomValueFromBoundary(heightRandomizeOptions.boundary) : 0;
                const z = Math.random() * depth;
                particle
                    .useTransition()
                    .from(new Vector3D({ x, z, y }))
                    .to(new Vector3D({ x, z, y: height }))
                    .in(randomValueFromBoundary(durationRandomizeOptions.boundary))
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