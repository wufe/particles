import { RecursivePartial, getDefault } from "../utils/object-utils";
import { LiquidParticleWrapper } from "./liquid/liquid-particle-wrapper";
import { BaseParticleSystem } from "./base-particle-system";
import { IParticleSystem } from "../models/particle-system";
import { ParticleDirection, Particle } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { TransitionEasingFunction } from "./transition/transition-specification";

export interface ITransitionParticleSystemParams {
    particles: {
        environment: {
            count: number;
        };
        background: {
            count: number;
        };
    }
}

const defaultTransitionParticleSystemParams: ITransitionParticleSystemParams = {
    particles: {
        environment: {
            count: 100
        },
        background: {
            count: 10
        }
    }
}

export class TransitionParticleSystemBuilder {

    public static build(params?: RecursivePartial<ITransitionParticleSystemParams>) {

        params = getDefault(params, defaultTransitionParticleSystemParams);

        return class extends BaseParticleSystem implements IParticleSystem {

            private _particles: LiquidParticleWrapper[] = [];
            private _lastTickTime = 0;

            attach() {

                // this.manager.context

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
                        particle.color.w = Math.random() / 2 + .2;
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
                        particle.color.w = Math.random() / 5 + .1;
                        particle.useTransition(this._lastTickTime)
                            .from(new Vector3D({ x: width / 2, y: height / 2, z: 0 }))
                            .to(new Vector3D({ x, y, z }))
                            .in(2000)
                            .easing(TransitionEasingFunction.QUADRATIC_IN_OUT)
                            .then(() => {
                                particle.setVelocity(ParticleDirection.UP, {
                                    randomize: true,
                                    boundary: {
                                        min: .1,
                                        max: .9
                                    }
                                });
                            });
                        return new LiquidParticleWrapper(particle, this.manager);
                    });
            }

            getParticles() {
                return this._particles.map(x => x.particle);;
            }

            tick(delta: number, time: number) {
                this._lastTickTime = time;
                this._particles
                    .forEach(x => x.particle.update(delta, time));
            }
        }
    }
}