export enum Unit {
    VMIN = 'vmin',
    VMAX = 'vmax',
    VW   = 'vw',
    VH   = 'vh',
    VD   = 'vd',
    PX   = 'px',
    ABS  = 'abs' // [-1, 1]
}

export const getPxFromUnit = (length: number, unit: Unit, width: number, height: number, depth: number, pixelRatio: number) => {
    if (unit === Unit.PX)
        return length * pixelRatio;
    if (unit === Unit.VW)
        return (length / 100) * width;
    if (unit === Unit.VH)
        return (length / 100) * height;
    if (unit === Unit.VD)
        return (length / 100) * depth;
    const vmax = Math.max(width, height, depth);
    if (unit === Unit.VMAX)
        return (length / 100) * vmax;
    const vmin = Math.min(width, height, depth);
    if (unit === Unit.ABS || unit === Unit.VMIN)
        return (length / 100) * vmin;
}