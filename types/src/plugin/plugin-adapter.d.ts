declare type HookCallback<T> = (object: T) => any;
export declare class PluginAdapter {
    _hooks: Hook<any>[];
    addBefore<T>(hook: HookType, callback: HookCallback<T>, next?: HookCallback<T>): void;
    addAfter<T>(hook: HookType, callback: HookCallback<T>, next?: HookCallback<T>): void;
    exec<T>(hook: HookType, bridge: T): void;
    getAll<T>(hook: HookType): Hook<T>[];
}
export declare type Hook<T> = {
    time: HookTime;
    type: HookType;
    callback: HookCallback<T>;
};
export declare enum HookTime {
    BEFORE = 0,
    AFTER = 1
}
export declare enum HookType {
    RENDERER_INIT = 0,
    CONTEXT_INIT = 1,
    CANVAS_INIT = 2,
    PRE_START = 3,
    DRAW = 4,
    UPDATE = 5,
    CANVAS_CLEAR = 6,
    SYSTEM_UPDATED = 7,
    WINDOW_RESIZE = 8
}
export {};
