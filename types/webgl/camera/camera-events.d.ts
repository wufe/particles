import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
export declare class CameraEvents {
    private _libraryInterface;
    private _gl;
    constructor(_libraryInterface: IWebGLLibraryInterface);
    private _lastMouseX;
    private _lastMouseY;
    private _currMouseX;
    private _currMouseY;
    private _isMouseDown;
    private _mouseSensitivity;
    private _zoomSensitivity;
    onChange: () => any;
    onForward: ((sensitivity: number) => any) | null;
    onBackward: ((sensitivity: number) => any) | null;
    onRight: ((sensitivity: number) => any) | null;
    onLeft: ((sensitivity: number) => any) | null;
    bind(canvas: HTMLCanvasElement): void;
    get zoomSensitivity(): number;
    get mouseSensitivity(): number;
}
