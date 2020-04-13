export interface IDrawingInterface {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | WebGLRenderingContext;
}
export declare class DrawingInterface implements IDrawingInterface {
    protected _canvas: HTMLCanvasElement;
    constructor();
    get canvas(): HTMLCanvasElement;
    private _context;
    get context(): CanvasRenderingContext2D | WebGLRenderingContext;
    set context(value: CanvasRenderingContext2D | WebGLRenderingContext);
}
