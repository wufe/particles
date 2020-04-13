export declare type TRandomizeOptions = {
    randomize: boolean;
    boundary?: TRandomizeBoundary;
};
export declare type TRandomizedValueOptions = TRandomizeOptions & {
    value?: number;
};
export declare type TRandomizeBoundary = {
    min: number;
    max: number;
};
export declare const valueFromRandomOptions: (options: TRandomizedValueOptions) => number;
export declare const randomValueFromBoundary: (boundary: TRandomizeBoundary) => number;
