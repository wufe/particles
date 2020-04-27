import { IVector3D, Vector3D } from "./vector3d";
import { IVector4D } from "./vector4d";
import { BaseListenableParticle, IParticleBase } from "./base-particle";
import { RecursivePartial } from "../utils/object-utils";
import { ITransitionSpecification, TransitionSpecificationBuilder } from "../systems/transition/transition-specification";
import { TRandomizeOptions, TRandomizeBoundary, TRandomizedValueOptions } from "../utils/random";
import { ILibraryInterface } from "../library-interface";
import { Unit } from "../utils/units";
export interface IMoveable {
    coords: IVector3D;
    velocity: IVector3D;
    updatePosition(): void;
    getTransitionSpecification(): ITransitionSpecification | null;
}
export interface IDrawable {
    size: number;
    setSize(value: number): void;
    color: IVector4D;
    alpha: number;
    setAlpha(value: number): void;
}
export interface IConnected {
    proximity: number;
    setNeighbours(neighbours: IParticle[]): void;
    getNeighbours(): IParticle[];
}
export interface IParticle extends IMoveable, IDrawable, IConnected, IParticleBase {
    update(delta: number, time: number): void;
}
export declare enum ParticleDirection {
    UP = "up",
    RIGHT = "right",
    DOWN = "down",
    LEFT = "left",
    FRONT = "front",
    BACK = "back"
}
declare type TVelocityConfigurationOptions = TRandomizeOptions;
export declare class Particle extends BaseListenableParticle implements IParticle {
    coords: Vector3D;
    private _manager;
    constructor(coords: Vector3D, _manager: ILibraryInterface);
    private _neighbours;
    proximity: number;
    private _proximitySubscription;
    setProximity(distance: number, unit?: Unit): void;
    unsetProximity(): void;
    setNeighbours(neighbours: IParticle[]): void;
    getNeighbours(): IParticle[];
    private _transitionSpecificationBuilder;
    getTransitionSpecification(): ITransitionSpecification;
    useTransition(): TransitionSpecificationBuilder;
    size: number;
    velocity: Vector3D;
    color: IVector4D;
    alpha: number;
    setVelocity(direction: ParticleDirection, options: RecursivePartial<TVelocityConfigurationOptions> | null): void;
    private _randomizeVectorComponent;
    setColor(r: number, g: number, b: number, a?: number): void;
    setSize(value: number): void;
    setSize(options: TRandomizeBoundary): void;
    setSize(options: TRandomizedValueOptions): void;
    private _randomOptionIsBoundary;
    setAlpha(value: number): void;
    private _lastTickDelta;
    private _lastTickTime;
    update(delta: number, time: number): void;
    updatePosition(): void;
    notifyUpdated(): void;
}
export {};
