import { IParticleSystem, TParticleSystemBuilder } from "../models/particle-system";
import { IParticle, Particle, ParticleDirection } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { BaseParticleSystem } from "./base-particle-system";
import { Unit } from "../utils/units";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { TRandomizedValueOptions, valueFromRandomOptions } from "../utils/random";
import { ILibraryInterface } from "../library-interface";

type TDefaultParticleSystemParams = {
    color: number[];
    count: TRandomizedValueOptions;
    size: TRandomizedValueOptions;
    proximity: {
        value: number;
        unit: Unit;
    };
}

export class DefaultParticleSystemBuilder {
    static build = (partialParams?: RecursivePartial<TDefaultParticleSystemParams>): TParticleSystemBuilder => ({
        build: (manager: ILibraryInterface) => new DefaultParticleSystem(manager, getDefault(partialParams, {
            color: [153, 255, 153, 1],
            size: { value: 10, randomize: false, boundary: { min: 20, max: 30 }},
            count: { value: 300, randomize: false, boundary: { min: 100, max: 200 }},
            proximity: { value: 15, unit: Unit.VMIN }
        }))
    })
}

export class DefaultParticleSystem extends BaseParticleSystem implements IParticleSystem {

    private _particles: IParticle[] = [];

    constructor(manager: ILibraryInterface, private _params: TDefaultParticleSystemParams) {
        super(manager);
    }

    attach() {
        const { width, height, depth } = this.manager.configuration;

        this.useLinks();

        const [r, g, b, a] = this._params.color;

        this._particles = new Array(Math.floor(valueFromRandomOptions(this._params.count)))
            .fill(null)
            .map(_ => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * depth;
                const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                particle.setProximity(this._params.proximity.value, this._params.proximity.unit);
                particle.setColor(r, g, b, a);
                particle.setSize(this._params.size)
                particle.setVelocity(ParticleDirection.UP, {
                    randomize: true,
                    boundary: {
                        min: -2,
                        max: 2
                    }
                });
                particle.setVelocity(ParticleDirection.RIGHT, {
                    randomize: true,
                    boundary: {
                        min: -2,
                        max: 2
                    }
                });
                particle.setVelocity(ParticleDirection.FRONT, {
                    randomize: true,
                    boundary: {
                        min: -2,
                        max: 2
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