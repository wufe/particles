import objectPath from 'object-path';

const typeIsObject = (t: any): t is object =>
    typeof t === 'object';

type TCallback<T> = (model: T, prev: T | undefined) => any;
type TCallbackContainer<T> = { id: Symbol, callback: TCallback<T>, deepPath?: string };
export type TSubscription<T> = { id: Symbol, value: T };

export interface IObservable<T> {
    subscribe(callback: TCallback<T>): TSubscription<T>;
    partialSubscribe<P>(portion: keyof T, callback: TCallback<T>): TSubscription<P>;
    partialSubscribe<P>(deepPath: string, callback: TCallback<T>): TSubscription<P>;
    unsubscribe(subscription: TSubscription<T>): void;
}

export class Observable<T> implements IObservable<T> {

    protected _callbacks: TCallbackContainer<T>[] = [];
    protected _lastValue: T;

    subscribe(callback: TCallback<T>) {
        const id = Symbol();
        this._callbacks.push({ id, callback });
        return { id, value: this._lastValue };
    }

    partialSubscribe<P = T>(portion: keyof T, callback: TCallback<P>): TSubscription<P>;
    partialSubscribe<P = T>(deepPath: string, callback: TCallback<P>): TSubscription<P>;
    partialSubscribe<P = T>(deepPath: string | keyof T, callback: TCallback<P>): TSubscription<P> {
        const id = Symbol();
        this._callbacks.push({ id, callback: callback as unknown as TCallback<T>, deepPath: deepPath as string });
        let prev = undefined;
        if (typeIsObject(prev))
            prev = objectPath.get(prev, deepPath as string);
        return { id, value: prev };
    }

    unsubscribe(subscription: TSubscription<T>) {
        throw new Error('Method not implemented');
    }
}

export interface ISubject<T> extends IObservable<T> {
    next(model: T): any;
}

export class Subject<T> extends Observable<T> implements ISubject<T> {

    next(model: T) {
        const prev = this._lastValue;
        const next = model;
        this._lastValue = model;
        this._callbacks.forEach(container => {
            if (!container.deepPath || !typeIsObject(next)) {
                container.callback(next, prev)
            } else {
                let partialPrev: any;
                let partialNext: any;
                if (objectPath.has(next, container.deepPath)) {
                    if (typeIsObject(prev)) {
                        partialPrev = objectPath.get(prev, container.deepPath);
                    } else {
                        partialPrev = undefined;
                    }
                    partialNext = objectPath.get(next, container.deepPath);
                    container.callback(partialNext, partialPrev);
                }
            }
        });
    }

}

export class BehaviorSubject<T> extends Subject<T> implements ISubject<T> {

    constructor(value: T) {
        super();
        this._lastValue = value;
    }

    subscribe(callback: TCallback<T>) {
        const ret = super.subscribe(callback);
        if (this._lastValue !== undefined)
            callback(this._lastValue, undefined);
        return ret;
    }

}