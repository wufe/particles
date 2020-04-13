import { Particle } from "../../models/particle";
import { ILibraryInterface } from "../../main";
export declare class LiquidParticleWrapper {
    particle: Particle;
    private _manager;
    constructor(particle: Particle, _manager: ILibraryInterface);
    onParticlePositionUpdate: () => void;
}
