type HookCallback<T> = (object: T) => any;

export class PluginAdapter {

    _hooks: Hook<any>[] = [];

    addBefore<T>(hook: HookType, callback: HookCallback<T>, next?: HookCallback<T>) {
        this._hooks.push({ time: HookTime.BEFORE, type: hook, callback });
    }

    addAfter<T>(hook: HookType, callback: HookCallback<T>, next?: HookCallback<T>) {
        this._hooks.push({ time: HookTime.AFTER, type: hook, callback });
    }

    exec<T>(hook: HookType, bridge: T) {
        this._hooks
            .forEach(h => h.type === hook && h.callback(bridge));
    }

    getAll<T>(hook: HookType): Hook<T>[] {
        return this._hooks.filter(x => x.type === hook);
    }
}

export type Hook<T> = {
    time: HookTime;
    type: HookType;
    callback: HookCallback<T>;
}

export enum HookTime {
    BEFORE,
    AFTER
}

export enum HookType {
    RENDERER_INIT,
    CONTEXT_INIT,
    CANVAS_INIT,
    PRE_START,
    DRAW,
    UPDATE,
    CANVAS_CLEAR,
    SYSTEM_UPDATED,
    WINDOW_RESIZE,
}