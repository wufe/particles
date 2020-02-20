import { ILibraryInterface } from "../main";
import { SystemBridgeEventNotification } from "../drawing/system-bridge";
import { IParticleSystem } from "../models/particle-system";
import { IParticle } from "../models/particle";

export abstract class BaseParticleSystem implements IParticleSystem {
    abstract attach(): void;
    abstract getParticles(): IParticle[];

    constructor(protected manager: ILibraryInterface) {}

    notifyWholeSystemChanged() {
        if (this.manager)
            this.manager.notify(SystemBridgeEventNotification.SYSTEM_UPDATED, this);
    }
}