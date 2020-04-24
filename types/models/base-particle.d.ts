import { IParticle } from "./particle";
import { IListenable, ListenableDispatcher } from "./listenable";
export declare enum ParticleEventType {
    POSITION_UPDATE = "positionUpdate",
    COLOR_UPDATE = "colorUpdate",
    UPDATE = "update"
}
export interface IParticleBase extends IListenable<IParticle, ParticleEventType> {
}
export declare class BaseListenableParticle extends ListenableDispatcher<IParticle, ParticleEventType> {
}
