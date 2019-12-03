export interface IDrawingInterface {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | WebGLRenderingContext;
}

export class DrawingInterface implements IDrawingInterface {

    protected _canvas: HTMLCanvasElement;

    constructor() {}

    get canvas() { return this._canvas }

    private _context: CanvasRenderingContext2D | WebGLRenderingContext;
    get context() { return this._context };
    set context(value: CanvasRenderingContext2D | WebGLRenderingContext) {
        this._context = value;
    }
}