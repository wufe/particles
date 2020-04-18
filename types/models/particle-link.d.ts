import { IParticle } from "./particle";
import { ListenableDispatcher, IListenable } from "./listenable";
export declare enum ParticleLinkEventType {
    UPDATE = "update"
}
export interface IParticleLink extends IListenable<IParticleLink, ParticleLinkEventType> {
    particleA: IParticle;
    particleB: IParticle;
}
export declare class ParticleLink extends ListenableDispatcher<IParticleLink, ParticleLinkEventType> implements IParticleLink {
    particleA: IParticle;
    particleB: IParticle;
    constructor(particleA: IParticle, particleB: IParticle);
    private _onParticleUpdate;
}
