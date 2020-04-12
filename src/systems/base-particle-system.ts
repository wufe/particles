import { ILibraryInterface } from "../main";
import { SystemBridgeEventNotification } from "../drawing/system-bridge";
import { IParticleSystem, TParticleSystemConfiguration } from "../models/particle-system";
import { IParticle } from "../models/particle";
import { RecursivePartial } from "../utils/object-utils";
import { SystemTimer, TTimerHandle } from "./timers/system-timer";

export abstract class BaseParticleSystem implements IParticleSystem {
    abstract attach(): void;
    abstract getParticles(): IParticle[];

    protected _lastTickDelta = -1;
    protected _lastTickTime = -1;

    private _systemTimer = new SystemTimer();

    constructor(protected manager: ILibraryInterface) {}

    notifyWholeSystemChanged() {
        if (this.manager)
            this.manager.notify(SystemBridgeEventNotification.SYSTEM_UPDATED, this);
    }

    updateInternalParameters(delta: number, time: number) {
        this._lastTickDelta = delta;
        this._lastTickTime = time;
    }

    public static configuration?: RecursivePartial<TParticleSystemConfiguration>;

    setTimeout(callback: () => any, timeout: number) {
        return this._systemTimer.add(callback, this._lastTickTime, this._lastTickTime + timeout, false);
    }

    setInterval(callback: () => any, timeout: number) {
        return this._systemTimer.add(callback, this._lastTickTime, this._lastTickTime + timeout, true);
    }

    clearTimeout(timerHandle: TTimerHandle) {
        return this._systemTimer.remove(timerHandle);
    }
}