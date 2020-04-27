declare type TCallback<T> = (model: T) => any;
declare type TCallbackContainer<T> = {
    id: Symbol;
    callback: TCallback<T>;
};
export declare type TSubscription<T> = {
    id: Symbol;
    value: T;
};
export interface IObservable<T> {
    subscribe(callback: TCallback<T>): TSubscription<T>;
    unsubscribe(subscription: TSubscription<T>): void;
}
export declare class Observable<T> implements IObservable<T> {
    protected _callbacks: TCallbackContainer<T>[];
    protected _lastValue: T;
    subscribe(callback: TCallback<T>): {
        id: symbol;
        value: T;
    };
    unsubscribe(subscription: TSubscription<T>): void;
}
export interface ISubject<T> extends IObservable<T> {
    next(model: T): any;
}
export declare class Subject<T> extends Observable<T> implements ISubject<T> {
    next(model: T): void;
}
export declare class BehaviorSubject<T> extends Subject<T> implements ISubject<T> {
    constructor(value: T);
    subscribe(callback: TCallback<T>): {
        id: symbol;
        value: T;
    };
}
export {};
