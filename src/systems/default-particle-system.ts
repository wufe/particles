import { IParticleSystem, TParticleSystemBuilder } from "../models/particle-system";
import { IParticle, Particle, ParticleDirection } from "../models/particle";
import { Vector3D } from "../models/vector3d";
import { BaseParticleSystem } from "./base-particle-system";
import { Unit } from "../utils/units";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { ILibraryInterface } from "../main";

type TDefaultParticleSystemParams = {
    color: number[];
}

export class DefaultParticleSystemBuilder {
    static build = (partialParams?: RecursivePartial<TDefaultParticleSystemParams>): TParticleSystemBuilder => ({
        build: (manager: ILibraryInterface) => new DefaultParticleSystem(manager, getDefault(partialParams, {
            color: [153, 255, 153, 1]
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

        this.useLinks(20, Unit.VMIN);

        const [r, g, b, a] = this._params.color;

        this._particles = new Array(300)
            .fill(null)
            .map(_ => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * depth;
                const particle = new Particle(new Vector3D({ x, y, z }), this.manager);
                particle.setColor(r, g, b, a);
                particle.setSize({ value: 20, randomize: true, boundary: { min: 20, max: 30 }})
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