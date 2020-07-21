import { IParticleSystem, ParticleSystemRequiredFeature } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { TTimerHandle } from "./timers/system-timer";
import { ILibraryInterface } from "../library-interface";
export declare abstract class BaseParticleSystem implements IParticleSystem {
    protected manager: ILibraryInterface;
    abstract attach(): void;
    abstract getParticles(): IParticle[];
    requirements: ParticleSystemRequiredFeature[];
    protected _lastTickDelta: number;
    protected _lastTickTime: number;
    private _systemTimer;
    constructor(manager: ILibraryInterface);
    notifyWholeSystemChanged(): void;
    updateInternalParameters(delta: number, time: number): void;
    setTimeout(callback: () => any, timeout: number): void;
    setInterval(callback: () => any, timeout: number): void;
    clearTimeout(timerHandle: TTimerHandle): void;
    useLinks(): void;
    useProximityDetection(): void;
    useTransitions(): void;
}
