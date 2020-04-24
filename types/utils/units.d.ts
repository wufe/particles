export declare enum Unit {
    VMIN = "vmin",
    VMAX = "vmax",
    VW = "vw",
    VH = "vh",
    VD = "vd",
    PX = "px",
    ABS = "abs"
}
export declare const getPxFromUnit: (length: number, unit: Unit, width: number, height: number, depth: number, pixelRatio: number) => number;
