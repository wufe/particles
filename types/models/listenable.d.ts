interface IListenableDispatcher<TModel, TEvent> extends IListenable<TModel, TEvent> {
    call(type: TEvent, model: TModel): void;
}
export interface IListenable<TModel, TEvent> {
    on(type: TEvent, callback: TListenableCallback<TModel>): void;
    off(type: TEvent, callback?: TListenableCallback<TModel>): void;
}
export declare type TListenableCallback<TModel> = (model: TModel) => any;
export declare type TEventListener<TEvent, TCallback> = {
    type: TEvent;
    callback: TCallback;
};
export declare class Listenable<TModel, TEvent> implements IListenable<TModel, TEvent> {
    protected _attachedEventListeners: TEventListener<TEvent, TListenableCallback<TModel>>[];
    on(type: TEvent, callback: TListenableCallback<TModel>): void;
    off(type: TEvent, callback?: TListenableCallback<TModel>): void;
}
export declare class ListenableDispatcher<TModel, TEvent> extends Listenable<TModel, TEvent> implements IListenableDispatcher<TModel, TEvent> {
    call(type: TEvent, model: TModel): void;
}
export {};
