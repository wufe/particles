import { TRandomizedValueOptions, valueFromRandomOptions } from "../utils/random";
import { LiquidParticleWrapper } from "./liquid-particle-wrapper";
import { Particle } from "../../models/particle";
import { ILibraryInterface } from "../../main";
import { Vector3D } from "../../models/vector3d";
import { BaseParticleSystem } from "../base-particle-system";

export type TLiquidParticlesCollectionParameters = {
    // viewport data
    width : number;
    height: number;
    depth : number;
} & TLiquidParticleSystemSquirt;

export type TLiquidParticleSystemSquirt = {
    count: number;
    opacity: TRandomizedValueOptions;
    size: TRandomizedValueOptions;

    spawnTimePerParticle: TRandomizedValueOptions;
    transitionDuration: TRandomizedValueOptions;

    from: (width: number, height: number, depth: number) => TRandomizedVector;

    to: (width: number, height: number, depth: number) => TRandomizedVector;
};

export type TRandomizedVector = {
    x: TRandomizedValueOptions;
    y: TRandomizedValueOptions;
    z: TRandomizedValueOptions;
};

export class LiquidParticlesCollection {

    private _particles: LiquidParticleWrapper[] = [];
    
    constructor(private _system: BaseParticleSystem) {}

    getParticles() {
        return this._particles;
    }

    build(parameters: TLiquidParticlesCollectionParameters, manager: ILibraryInterface) {

        const { width, height, depth } = parameters;

        const from = parameters.from(width, height, depth);
        const to = parameters.to(width, height, depth);

        this._particles = new Array(parameters.count)
            .fill(null)
            .map((_, i) => {
                const particle = new Particle(new Vector3D({ x: 0, y: 0, z: 0 }), manager);
                particle.setSize(parameters.size);
                particle.color.w = valueFromRandomOptions(parameters.opacity);
                this._setupParticlePositionTransition(particle, i, parameters, from, to);
                return new LiquidParticleWrapper(particle, manager);
            });

        this._system.setInterval(() => {
            this._particles
                .forEach((particle, i) => this._setupParticlePositionTransition(particle.particle, i, parameters, from, to));
        }, this._calculateSquirtTimespan(parameters))
        return this;
    }

    private _setupParticlePositionTransition(particle: Particle, index: number, parameters: TLiquidParticlesCollectionParameters, from: TRandomizedVector, to: TRandomizedVector) {
        particle
            .useTransition()
            .within(valueFromRandomOptions(parameters.spawnTimePerParticle) * index)
            .from({
                x: valueFromRandomOptions(from.x),
                y: valueFromRandomOptions(from.y),
                z: valueFromRandomOptions(from.z),
            })
            .to({
                x: valueFromRandomOptions(to.x),
                y: valueFromRandomOptions(to.y),
                z: valueFromRandomOptions(to.z),
            })
            .in(valueFromRandomOptions(parameters.transitionDuration))
            .commit();
    }

    private _calculateSquirtTimespan(parameters: TLiquidParticlesCollectionParameters) {
        const { count, spawnTimePerParticle, transitionDuration } = parameters;
        return count *
            (spawnTimePerParticle.randomize ? spawnTimePerParticle.boundary.max : spawnTimePerParticle.value!) +
            (transitionDuration.randomize ? transitionDuration.boundary.max : transitionDuration.value!);
    }

}