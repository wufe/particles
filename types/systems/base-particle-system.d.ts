import { ILibraryInterface } from "../main";
import { IParticleSystem, TSystemLinksConfiguration } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { TTimerHandle } from "./timers/system-timer";
import { Unit } from "../utils/units";
export declare abstract class BaseParticleSystem implements IParticleSystem {
    protected manager: ILibraryInterface;
    abstract attach(): void;
    abstract getParticles(): IParticle[];
    links: TSystemLinksConfiguration;
    protected _lastTickDelta: number;
    protected _lastTickTime: number;
    private _systemTimer;
    constructor(manager: ILibraryInterface);
    notifyWholeSystemChanged(): void;
    updateInternalParameters(delta: number, time: number): void;
    setTimeout(callback: () => any, timeout: number): void;
    setInterval(callback: () => any, timeout: number): void;
    clearTimeout(timerHandle: TTimerHandle): void;
    useLinks(distance: number, unit?: Unit): void;
}
