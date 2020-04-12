type TCallback = () => any;

export type TTimerHandle = {
    callback : TCallback;
    since    : number;
    when     : number;
    fired    : boolean;
    recurrent: boolean;
};

export class SystemTimer {

    private _timers: TTimerHandle[] = [];

    add(callback: TCallback, since: number, when: number, recurrent: boolean) {
        this._timers.push({ callback, since, when, recurrent, fired: false });
    }

    check(currentTime: number) {
        this._timers.forEach(timer => {
            if (currentTime >= timer.when) {
                timer.callback();
                if (!timer.recurrent) {
                    timer.fired = true;
                } else {
                    timer.when = currentTime + (timer.when - timer.since);
                    timer.since = currentTime;
                }
            }
        });
        this._timers = this._timers.filter(h => !h.fired);
    }

    remove(timerHandle: TTimerHandle) {
        this._timers = this._timers.filter(h => h !== timerHandle);
    }
}