import { ILibraryInterface } from "../main";
import { IParticleSystem, TParticleSystemConfiguration, SystemLinksConfiguration } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { RecursivePartial } from "../utils/object-utils";
import { TTimerHandle } from "./timers/system-timer";
import { Unit } from "../utils/units";
export declare abstract class BaseParticleSystem implements IParticleSystem {
    protected manager: ILibraryInterface;
    abstract attach(): void;
    abstract getParticles(): IParticle[];
    links: SystemLinksConfiguration;
    protected _lastTickDelta: number;
    protected _lastTickTime: number;
    private _systemTimer;
    constructor(manager: ILibraryInterface);
    notifyWholeSystemChanged(): void;
    updateInternalParameters(delta: number, time: number): void;
    static configuration?: RecursivePartial<TParticleSystemConfiguration>;
    setTimeout(callback: () => any, timeout: number): void;
    setInterval(callback: () => any, timeout: number): void;
    clearTimeout(timerHandle: TTimerHandle): void;
    useLinks(distance: number, unit?: Unit): void;
}
