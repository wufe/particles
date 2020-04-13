import { IParticleSystem } from "../models/particle-system";
export declare enum SystemBridgeEventNotification {
    SYSTEM_UPDATED = "systemUpdated"
}
export interface ISystemBridge {
    notify(type: SystemBridgeEventNotification, system: IParticleSystem): void;
}
