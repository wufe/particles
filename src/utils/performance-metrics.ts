export class PerformanceMetricsHelper {

    private _metrics: {
        [key: string]: any;
    } = {};
    
    set(key: string, value: any) {
        this._metrics[key] = value;
    }

    get() {
        return this._metrics;
    }

}

export const performanceMetricsHelper = new PerformanceMetricsHelper();