type TCallback<T> = (model: T) => any;
type TCallbackContainer<T> = { id: Symbol, callback: TCallback<T> };
type TSubscription<T> = { id: Symbol, value: T };

export interface IObservable<T> {
    subscribe(callback: TCallback<T>): TSubscription<T>;
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

    unsubscribe(subscription: TSubscription<T>) {
        throw new Error('Method not implemented');
    }
}

export interface ISubject<T> extends IObservable<T> {
    next(model: T): any;
}

export class Subject<T> extends Observable<T> implements ISubject<T> {

    next(model: T) {
        this._lastValue = model;
        this._callbacks.forEach(container => container.callback(model));
    }

}

export class ImmediateSubject<T> extends Subject<T> implements ISubject<T> {

    subscribe(callback: TCallback<T>) {
        const ret = super.subscribe(callback);
        if (this._lastValue !== undefined)
            callback(this._lastValue);
        return ret;
    }

}