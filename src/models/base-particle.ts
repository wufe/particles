import { IParticle, Particle } from "./particle";
import { IListenable, ListenableDispatcher } from "./listenable";

export enum ParticleEventType {
    POSITION_UPDATE = 'positionUpdate',
    COLOR_UPDATE    = 'colorUpdate',
    UPDATE          = 'update',
}

export interface IParticleBase extends IListenable<IParticle, ParticleEventType> {}

export class BaseListenableParticle extends ListenableDispatcher<IParticle, ParticleEventType> {}