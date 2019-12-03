export type RecursivePartial<T> = {
    [P in keyof T]?:
        T[P] extends (infer U)[] ? RecursivePartial<U>[] :
        T[P] extends object ? RecursivePartial<T[P]> :
        T[P];
};

export type DefaultObject<T> = {
    [P in keyof T]?:
        T[P] extends (infer U)[] ? (RecursivePartial<U>[] | LazyFactory<RecursivePartial<U>[]>) :
        T[P] extends object ? (RecursivePartial<T[P]> | LazyFactory<T[P]>):
        T[P];
};

export const getDefault = <T>(gotObject: RecursivePartial<T>, defaultObject: T | DefaultObject<T>): T => {
    if (gotObject === undefined) {
        if (defaultObject instanceof LazyFactory) {
            return defaultObject.build();
        } else {
            return defaultObject as T;
        }
    }
    if (typeof defaultObject === 'object' && !Array.isArray(defaultObject) && !(defaultObject instanceof LazyFactory)) {
        const newGotObject: Partial<T> = {};
        for (const key in defaultObject as T) {
            newGotObject[key] = getDefault(gotObject[key] as any, (defaultObject as T)[key]);
        }
        return newGotObject as unknown as T;
    }
    return gotObject as unknown as T;
}

export class LazyFactory<T> {
    constructor(private _callback: () => T) {}

    build(): T {
        return this._callback();
    }
}

export const stringFormat = function(str: string, ..._: any[]) {
    if (arguments.length) {
        var t = typeof arguments[1];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
			: arguments[1];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};