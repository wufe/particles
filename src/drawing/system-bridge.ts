import { IParticleSystem } from "../models/particle-system";

export enum SystemBridgeEventNotification {
    CHANGE = 'change',
}

export interface ISystemBridge {
    notify(type: SystemBridgeEventNotification, system: IParticleSystem): void;
}