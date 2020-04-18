import { IParticle } from "./particle";
import { IListenable, ListenableDispatcher } from "./listenable";
export declare enum ParticleEventType {
    POSITION_UPDATE = "positionUpdate",
    ALPHA_UPDATE = "alphaUpdate",
    UPDATE = "update"
}
export interface IParticleBase extends IListenable<IParticle, ParticleEventType> {
}
export declare class BaseListenableParticle extends ListenableDispatcher<IParticle, ParticleEventType> {
}
