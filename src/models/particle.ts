import { IVector3D, Vector3D } from "./vector3d";
import { Vector4D, IVector4D } from "./vector4d";
import { ParticleSector, IParticleSector } from "./particle-sector";
import { ILibraryInterface } from "../main";
import { IListenable, ParticleEventType, BaseListenableParticle } from "./base-particle";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { ITransitionSpecification, TransitionSpecificationBuilder } from "../systems/transition/transition-specification";

// Represents the parameter and the methods required by the particle
// to move through the available space.
// It uses coordinates for the current tick (*i.e.* frame),
// and a velocity, which automatically increments the coords accordingly.
export interface IMoveable {
    coords    : IVector3D;
    velocity  : IVector3D; // Change in position in one unit of time (*i.e.* 16ms)
    sector    : IVector3D;

    updatePosition(): void;
    getTransitionSpecification(): ITransitionSpecification | null;
    getAdjacentSectors(): IParticleSector[];
}

// Contains the properties required by the particle
// to be drawn onto the scene.
export interface IDrawable {
    size : number;
    setSize(value: number): void;
    color: IVector4D;
    alpha: number;
    setAlpha(value: number): void;
}

export interface IParticle extends IMoveable, IDrawable, IListenable<ParticleEventType> {
    update(): void;
    update(delta: number, time: number): void;
}

type TRandomizeOptions = {
    randomize            : boolean;
    boundary             : {
        min: number;
        max: number;
    };
};

//#region Movement
export enum ParticleDirection {
    UP    = 'up',
    RIGHT = 'right',
    DOWN  = 'down',
    LEFT  = 'left',
    FRONT = 'front',
    BACK  = 'back',
}
//#endregion

//#region Velocity
type TVelocityConfigurationOptions = TRandomizeOptions;
const defaultVelocityConfigurationOptions: TVelocityConfigurationOptions = {
    randomize: false,
    boundary: {
        min: 0,
        max: 1
    }
}
//#endregion

export class Particle extends BaseListenableParticle implements IParticle {
    
    constructor(public coords: Vector3D = new Vector3D(), private _manager: ILibraryInterface) {
        super();
        this.calculateSector();
    }

    private _transitionSpecificationBuilder = new TransitionSpecificationBuilder(this);

    getTransitionSpecification() {
        return this._transitionSpecificationBuilder && this._transitionSpecificationBuilder.specification;
    }

    useTransition(currentTime: number) {
        const transitionSpecificationBuilder = new TransitionSpecificationBuilder(this);
        this._transitionSpecificationBuilder = transitionSpecificationBuilder;
        return transitionSpecificationBuilder.enable(currentTime);
    }

    size     : number    = 2;
    velocity : Vector3D  = new Vector3D();
    color    : IVector4D = new Vector4D({
        x: 255,
        y: 255,
        z: 255,
        w: 1
    });
    alpha: number = 1;

    sector: IParticleSector;

    calculateSector() {
        const sectorLength = this._manager
            .particlesSectorManager
            .sectorLength;
        const sectorX = Math.floor(this.coords.x / sectorLength);
        const sectorY = Math.floor(this.coords.y / sectorLength);
        const sectorZ = Math.floor(this.coords.z / sectorLength);
        this.sector = this._manager
            .particlesSectorManager
            .getSectorByIndex(sectorX, sectorY, sectorZ);
    }

    setVelocity(direction: ParticleDirection, options: RecursivePartial<TVelocityConfigurationOptions> | null ) {

        let velocityOptions: TVelocityConfigurationOptions;

        if (options === null) {
            velocityOptions = defaultVelocityConfigurationOptions;
        } else {
            velocityOptions = getDefault(options, defaultVelocityConfigurationOptions);
        }

        const { min, max } = options.boundary;
        const range = max - min;

        const velocity = this.velocity;
        switch (direction) {
            case ParticleDirection.UP:
                velocity.y = 1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'y', range, min);
                break;
            case ParticleDirection.RIGHT:
                velocity.x = 1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'x', range, min);
                break;
            case ParticleDirection.DOWN:
                velocity.y = -1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'y', range, min);
                break;
            case ParticleDirection.LEFT:
                velocity.x = -1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'x', range, min);
                break;
            case ParticleDirection.FRONT:
                velocity.z = 1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'z', range, min);
                break;
            case ParticleDirection.BACK:
                velocity.z = -1;
                velocityOptions.randomize && this._randomizeVectorComponent(velocity, 'z', range, min);
                break;
        }

        this.velocity = velocity;
    }

    private _randomizeVectorComponent(vector: IVector3D, component: keyof IVector3D, range: number, min: number) {
        if (vector[component])
            vector[component] = vector[component] * Math.random() * range + min;
    }

    setSize(value: number): void;
    setSize(options: TRandomizeOptions['boundary']): void;
    setSize(valueOrRandom: number | TRandomizeOptions['boundary']) {
        if (typeof valueOrRandom === 'number') {
            this.size = valueOrRandom;
        } else {
            const { min, max } = valueOrRandom;
            const range = max - min;
            this.size = Math.random() * range + min;
        }
    }

    setAlpha(value: number): void {
        if (value !== this.alpha) {
            this.alpha = value;
            this.call(ParticleEventType.ALPHA_UPDATE, this);
        }
    }

    private _lastTickDelta: number = -1;
    private _lastTickTime: number = -1;
    update(delta?: number, time?: number) {
        if (delta !== undefined)
            this._lastTickDelta = delta;
        if (time !== undefined)
            this._lastTickTime = time;
        this.updatePosition();
        this.calculateSector();
        this.call(ParticleEventType.POSITION_UPDATE, this);
        this.call(ParticleEventType.UPDATE, this);
    }

    // Updates position according to velocity
    updatePosition() {
        if (this.velocity) {
            this.coords.add(this.velocity);
        }
    }

    getAdjacentSectors(): IParticleSector[] {
        return this.sector.getAdjacentSectors();
    }
}
