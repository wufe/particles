export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
export declare type DefaultObject<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? (RecursivePartial<U>[] | LazyFactory<RecursivePartial<U>[]>) : T[P] extends object ? (RecursivePartial<T[P]> | LazyFactory<T[P]>) : T[P];
};
export declare const getDefault: <T>(gotObject: RecursivePartial<T>, defaultObject: T | DefaultObject<T>) => T;
export declare class LazyFactory<T> {
    private _callback;
    constructor(_callback: () => T);
    build(): T;
}
export declare const stringFormat: (str: string, ..._: any[]) => string;
