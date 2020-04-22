import { IVector3D, Vector3D } from "./vector3d";
import { Vector4D, IVector4D } from "./vector4d";
import { ILibraryInterface } from "../main";
import { ParticleEventType, BaseListenableParticle, IParticleBase } from "./base-particle";
import { RecursivePartial, getDefault } from "../utils/object-utils";
import { ITransitionSpecification, TransitionSpecificationBuilder } from "../systems/transition/transition-specification";
import { TRandomizeOptions, TRandomizeBoundary, TRandomizedValueOptions, randomValueFromBoundary, valueFromRandomOptions } from "../utils/random";
import { getColor } from "../rendering/renderer-webgl";

// Represents the parameter and the methods required by the particle
// to move through the available space.
// It uses coordinates for the current tick (*i.e.* frame),
// and a velocity, which automatically increments the coords accordingly.
export interface IMoveable {
    coords    : IVector3D;
    velocity  : IVector3D; // Change in position in one unit of time (*i.e.* 16ms)

    updatePosition(): void;
    getTransitionSpecification(): ITransitionSpecification | null;
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

export interface IParticle extends IMoveable, IDrawable, IParticleBase {
    update(delta: number, time: number): void;
}

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
    }

    private _transitionSpecificationBuilder = new TransitionSpecificationBuilder(this);

    getTransitionSpecification() {
        return this._transitionSpecificationBuilder && this._transitionSpecificationBuilder.specification;
    }

    useTransition() {
        const transitionSpecificationBuilder = new TransitionSpecificationBuilder(this);
        this._transitionSpecificationBuilder = transitionSpecificationBuilder;
        return transitionSpecificationBuilder.enable(this._lastTickTime);
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

    private _randomizeVectorComponent(vector: IVector3D, component: keyof Pick<IVector3D, 'x' | 'y' | 'z'>, range: number, min: number) {
        if (vector[component])
            vector[component] = vector[component] * Math.random() * range + min;
    }

    setColor(r: number, g: number, b: number, a?: number) {
        const [x, y, z, w] = getColor(r, g, b, a);
        this.color = new Vector4D({ x, y, z, w });
        this.call(ParticleEventType.COLOR_UPDATE, this);
    }

    setSize(value: number): void;
    setSize(options: TRandomizeBoundary): void;
    setSize(options: TRandomizedValueOptions): void;
    setSize(valueOrRandom: number | TRandomizeBoundary | TRandomizedValueOptions) {
        if (typeof valueOrRandom === 'number') {
            this.size = valueOrRandom;
        } else {
            if (this._randomOptionIsBoundary(valueOrRandom)) {
                this.size = randomValueFromBoundary(valueOrRandom);
            } else {
                this.size = valueFromRandomOptions(valueOrRandom);
            }
        }
        this.size = this.size * this._manager.configuration.pixelRatio;
    }

    private _randomOptionIsBoundary(randomOption: TRandomizeBoundary | TRandomizedValueOptions): randomOption is TRandomizeBoundary {
        const option = <any>randomOption;
        return option.min !== undefined && option.max !== undefined &&
            option.boundary === undefined && option.value === undefined;
    }

    setAlpha(value: number): void {
        this.color.w = value;
        this.call(ParticleEventType.COLOR_UPDATE, this);
    }

    private _lastTickDelta: number = -1;
    private _lastTickTime: number = -1;
    update(delta: number, time: number) {
        
        const transition = this._transitionSpecificationBuilder;

        if (transition.specification.enabled) {
            if (time) {
                if (time + 16 >= transition.specification.endTime)
                    transition.tryInvokeCallback();
            }
        } else {
            this.updatePosition();
            this.call(ParticleEventType.POSITION_UPDATE, this);
            this.notifyUpdated();
        }
        
    }

    // Updates position according to velocity
    updatePosition() {
        if (this.velocity) {
            this.coords.add(this.velocity);
        }
    }

    notifyUpdated() {
        this.call(ParticleEventType.UPDATE, this);
    }
}
