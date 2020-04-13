import { IVector3D } from "../../models/vector3d";
import { Particle } from "../../models/particle";
export declare enum TransitionEasingFunction {
    LINEAR = 1,
    QUADRATIC_IN = 2,
    QUADRATIC_OUT = 3,
    QUADRATIC_IN_OUT = 4
}
export interface ITransitionSpecification {
    enabled: boolean;
    start: IVector3D;
    end: IVector3D;
    startTime: number;
    endTime: number;
    easing: TransitionEasingFunction;
    committed: boolean;
}
export declare class TransitionSpecificationBuilder {
    private _particle;
    specification: ITransitionSpecification;
    private _timeout;
    private _transitionCallback;
    constructor(_particle: Particle);
    enable(startTime: number): this;
    within(value: number): this;
    from(value: IVector3D): this;
    to(value: IVector3D): this;
    in(value: number): this;
    easing(value: TransitionEasingFunction): this;
    then<T = unknown>(callback: () => T): this;
    commit(): this;
    tryInvokeCallback: () => void;
}
