import { IParticle } from "./particle";
export declare type TParticleCallback = (particle: IParticle) => any;
export interface IListenable<TEvent> {
    on(type: TEvent, callback: TParticleCallback): void;
    off(type: TEvent, callback?: TParticleCallback): void;
}
export declare enum ParticleEventType {
    POSITION_UPDATE = "positionUpdate",
    ALPHA_UPDATE = "alphaUpdate",
    UPDATE = "update"
}
declare type TEventListener<TEvent, TCallback> = {
    type: TEvent;
    callback: TCallback;
};
export declare class BaseListenableParticle implements IListenable<ParticleEventType> {
    protected _attachedEventListeners: TEventListener<ParticleEventType, TParticleCallback>[];
    on(type: ParticleEventType, callback: TParticleCallback): void;
    off(type: ParticleEventType, callback?: TParticleCallback): void;
    protected call(type: ParticleEventType, particle: IParticle): void;
}
export {};
