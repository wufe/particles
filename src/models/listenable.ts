interface IListenableDispatcher<TModel, TEvent> extends IListenable<TModel, TEvent> {
    call(type: TEvent, model: TModel): void;
}

export interface IListenable<TModel, TEvent> {
    // Adding the possibility to add more listeners
    // in order to be used by the renderer and by a possible wrapper
    // which would be responsible for the lifetime of the particle
    on(type: TEvent, callback: TListenableCallback<TModel>): void;
    off(type: TEvent, callback?: TListenableCallback<TModel>): void;
}

export type TListenableCallback<TModel> = (model: TModel) => any;

export type TEventListener<TEvent, TCallback> = {
    type: TEvent;
    callback: TCallback;
}

export class Listenable<TModel, TEvent> implements IListenable<TModel, TEvent> {

    protected _attachedEventListeners: TEventListener<TEvent, TListenableCallback<TModel>>[] = [];

    on(type: TEvent, callback: TListenableCallback<TModel>): void {
        this._attachedEventListeners.push({ type, callback });
    }

    off(type: TEvent, callback?: TListenableCallback<TModel>): void {
        let eventIndex = -1;

        if (callback !== undefined) {
            eventIndex = this._attachedEventListeners.findIndex(e =>
                e.type === type && e.callback === callback);
        } else {
            eventIndex = this._attachedEventListeners.findIndex(e =>
                e.type === type);
        }
        
        if (eventIndex > -1) {
            this._attachedEventListeners =
                this._attachedEventListeners.slice(0, eventIndex).concat(
                    this._attachedEventListeners.slice(eventIndex +1)
                );
        }

    }

}

export class ListenableDispatcher<TModel, TEvent> extends Listenable<TModel, TEvent> implements IListenableDispatcher<TModel, TEvent> {

    call(type: TEvent, model: TModel): void {
        this._attachedEventListeners
            .filter(e => e.type === type)
            .forEach(e => e.callback(model));
    }

}