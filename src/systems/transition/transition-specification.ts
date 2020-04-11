import { IVector3D, ZeroVector3D, Vector3D } from "../../models/vector3d";
import { Particle } from "../../models/particle";

export enum TransitionEasingFunction {
    LINEAR           = 1,
    QUADRATIC_IN     = 2,
    QUADRATIC_OUT    = 3,
    QUADRATIC_IN_OUT = 4,
}

export interface ITransitionSpecification {
    enabled: boolean;
    start: IVector3D;
    end: IVector3D;
    startTime: number;
    endTime: number;
    easing: TransitionEasingFunction;
}

export class TransitionSpecificationBuilder {
    specification: ITransitionSpecification = {
        enabled: false,
        start: new Vector3D(),
        end: new Vector3D(),
        startTime: 0,
        endTime: 0,
        easing: TransitionEasingFunction.LINEAR,
    };

    private _timeout: number | null = null;
    private _transitionCallback: (() => any) | null = null;

    constructor(private _particle: Particle) {}

    enable(startTime: number) {
        this.specification.startTime = startTime;
        this.specification.enabled = true;
        return this;
    }

    from(value: IVector3D) {
        this.specification.start = value;
        return this;
    }

    to(value: IVector3D) {
        this.specification.end = value;
        this._particle.coords = new Vector3D(value);
        return this;
    }

    in(value: number) {
        this.specification.endTime = this.specification.startTime + value;
        clearTimeout(this._timeout);
        const modeSwitchDuration = 600; // TODO: Retrieve from real insights
        this._timeout = setTimeout(() => {
            if (this._transitionCallback)
                this._transitionCallback();
        }, value - modeSwitchDuration)
        return this;
    }

    easing(value: TransitionEasingFunction) {
        this.specification.easing = value;
        return this;
    }

    then<T = unknown>(callback: () => T) {
        this._transitionCallback = callback;
    }


}