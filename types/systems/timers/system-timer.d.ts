declare type TCallback = () => any;
export declare type TTimerHandle = {
    callback: TCallback;
    since: number;
    when: number;
    fired: boolean;
    recurrent: boolean;
};
export declare class SystemTimer {
    private _timers;
    add(callback: TCallback, since: number, when: number, recurrent: boolean): void;
    check(currentTime: number): void;
    remove(timerHandle: TTimerHandle): void;
}
export {};
