import { IParticle } from "./particle";

export type TParticleCallback = (particle: IParticle) => any;

export interface IListenable<TEvent> {
    // Adding the possibility to add more listeners
    // in order to be used by the renderer and by a possible wrapper
    // which would be responsible for the lifetime of the particle
    on(type: TEvent, callback: TParticleCallback): void;
    off(type: TEvent, callback: TParticleCallback): void;
}

export enum ParticleEventType {
    POSITION_UPDATE = 'positionUpdate',
    ALPHA_UPDATE = 'alphaUpdate',
    UPDATE = 'update',
}

type TEventListener<TEvent, TCallback> = {
    type: TEvent;
    callback: TCallback;
}

export class BaseListenableParticle implements IListenable<ParticleEventType> {

    protected _attachedEventListeners: TEventListener<ParticleEventType, TParticleCallback>[] = [];

    on(type: ParticleEventType, callback: TParticleCallback): void {
        this._attachedEventListeners.push({ type, callback });
    }

    off(type: ParticleEventType, callback: TParticleCallback): void {

        const eventIndex = this._attachedEventListeners.findIndex(e =>
            e.type === type && e.callback === callback);

        if (eventIndex > -1) {
            this._attachedEventListeners =
                this._attachedEventListeners.slice(0, eventIndex).concat(
                    this._attachedEventListeners.slice(eventIndex +1)
                );
        }
    }

    protected call(type: ParticleEventType, particle: IParticle) {
        this._attachedEventListeners
            .filter(e => e.type === type)
            .forEach(e => e.callback(particle));
    }
}