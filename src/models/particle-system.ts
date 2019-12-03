import { IParticle } from "./particle";
import { ISystemBridge } from "../drawing/system-bridge";

export interface IParticleSystem {
    attach(manager: ISystemBridge): void;
    getParticles: () => IParticle[];
    tick?: (deltaT: number, T: number) => void;
}