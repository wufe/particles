import { IVector3D, Vector3D } from "./vector3d";
import { IVector4D } from "./vector4d";
import { IParticleSector } from "./particle-sector";
import { ILibraryInterface } from "../main";
import { IListenable, ParticleEventType, BaseListenableParticle } from "./base-particle";
import { RecursivePartial } from "../utils/object-utils";
import { ITransitionSpecification, TransitionSpecificationBuilder } from "../systems/transition/transition-specification";
import { TRandomizeOptions, TRandomizeBoundary, TRandomizedValueOptions } from "../utils/random";
export interface IMoveable {
    coords: IVector3D;
    velocity: IVector3D;
    sector: IVector3D;
    updatePosition(): void;
    getTransitionSpecification(): ITransitionSpecification | null;
    getAdjacentSectors(): IParticleSector[];
}
export interface IDrawable {
    size: number;
    setSize(value: number): void;
    color: IVector4D;
    alpha: number;
    setAlpha(value: number): void;
}
export interface IParticle extends IMoveable, IDrawable, IListenable<ParticleEventType> {
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
    private _transitionSpecificationBuilder;
    getTransitionSpecification(): ITransitionSpecification;
    useTransition(): TransitionSpecificationBuilder;
    size: number;
    velocity: Vector3D;
    color: IVector4D;
    alpha: number;
    sector: IParticleSector;
    calculateSector(): void;
    setVelocity(direction: ParticleDirection, options: RecursivePartial<TVelocityConfigurationOptions> | null): void;
    private _randomizeVectorComponent;
    setSize(value: number): void;
    setSize(options: TRandomizeBoundary): void;
    setSize(options: TRandomizedValueOptions): void;
    private _randomOptionIsBoundary;
    setAlpha(value: number): void;
    private _lastTickDelta;
    private _lastTickTime;
    update(delta: number, time: number): void;
    updatePosition(): void;
    getAdjacentSectors(): IParticleSector[];
    notifyUpdated(): void;
}
export {};
