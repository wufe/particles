export type TRandomizeOptions = {
    randomize: boolean;
    boundary?: TRandomizeBoundary;
};

export type TRandomizedValueOptions = TRandomizeOptions & {
    value?: number;
};

export type TRandomizeBoundary = {
    min: number;
    max: number;
};

export const valueFromRandomOptions = (options: TRandomizedValueOptions) => {
    if (options.randomize)
        return randomValueFromBoundary(options.boundary);
    return options.value!;
}

export const randomValueFromBoundary = (boundary: TRandomizeBoundary) => {
    const { min, max } = boundary;
    const range = max - min;
    return Math.random() * range + min;
}