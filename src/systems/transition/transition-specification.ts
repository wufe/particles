import { IVector3D, ZeroVector3D, Vector3D } from "../../models/vector3d";
import { Particle } from "../../models/particle";

export enum TransitionEasingFunction {
    LINEAR = 1,
}

export interface ITransitionSpecification {
    enabled: boolean;
    from: IVector3D;
    target: IVector3D;
    until: number;
    easing: TransitionEasingFunction;
}

export class TransitionSpecificationBuilder {
    specification: ITransitionSpecification = {
        enabled: false,
        from: new Vector3D(),
        target: new Vector3D(),
        until: 0,
        easing: TransitionEasingFunction.LINEAR,
    };

    constructor(private _particle: Particle) {}

    enable() {
        this.specification.enabled = true;
        return this;
    }

    from(value: IVector3D) {
        this.specification.from = value;
        return this;
    }

    to(value: IVector3D) {
        this.specification.target = value;
        this._particle.coords = new Vector3D(value);
        return this;
    }

    in(value: number) {
        this.specification.until = value;
        return this;
    }
}