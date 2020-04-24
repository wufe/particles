export declare class PerformanceMetricsHelper {
    private _metrics;
    constructor();
    set(key: string, value: any): void;
    get(): {
        [key: string]: any;
    };
}
export declare const performanceMetricsHelper: PerformanceMetricsHelper;
