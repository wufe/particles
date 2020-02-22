import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";

const radiansToDegrees = (r: number) => r * 180 / Math.PI;

const degreesToRadians = (d: number) => d * Math.PI / 180;

export class CameraEvents {
	private _gl: WebGLRenderingContext;


	constructor(
		private _libraryInterface: IWebGLLibraryInterface
	) {}

	private _lastMouseX: number;
	private _lastMouseY: number;
	private _currMouseX: number;
	private _currMouseY: number;
	private _isMouseDown = false;
	private _mouseSensitivity = .01;
	private _zoomSensitivity = .00005;

	public onChange    : () => any;
	public onForward   : ((sensitivity: number) => any) | null;
	public onBackward  : ((sensitivity: number) => any) | null;
	public onRight     : ((sensitivity: number) => any) | null;
	public onLeft      : ((sensitivity: number) => any) | null;

	bind(
		canvas: HTMLCanvasElement
	) {
		canvas.addEventListener('mousedown', event => {
			this._lastMouseX = event.x;
			this._lastMouseY = event.y;
			this._isMouseDown = true;
		});
		canvas.addEventListener('mouseup', event => {
			this._isMouseDown = false;
		});
		canvas.addEventListener('mousemove', event => {
			if (this._isMouseDown) {
				this._currMouseX = event.x;
				this._currMouseY = event.y;
				let mouseMovX = (this._currMouseX - this._lastMouseX) * this._mouseSensitivity;
				let mouseMovY = (this._currMouseY - this._lastMouseY) * this._mouseSensitivity;
				this._lastMouseX = this._currMouseX;
				this._lastMouseY = this._currMouseY;

				let { pitch, yaw } = this._libraryInterface.configuration.webgl.camera;

				pitch -= mouseMovX;
				yaw -= mouseMovY;

				// pitch = Math.max(pitch, -1 * (Math.PI / 2));
				// pitch = Math.min(pitch, Math.PI / 2);

				yaw = Math.max(yaw, (-1 * (Math.PI / 2)) + .0001);
				yaw = Math.min(yaw, Math.PI / 2);

				this._libraryInterface.configuration.webgl.camera.pitch = pitch;
				this._libraryInterface.configuration.webgl.camera.yaw = yaw;

				if (this.onChange)
					this.onChange();
				
			}
		});
	
		canvas.addEventListener('wheel', event => {
			this._libraryInterface.configuration.webgl.camera.zoom += event.deltaY * this._zoomSensitivity;
			this._libraryInterface.configuration.webgl.camera.zoom = Math.min(10, this._libraryInterface.configuration.webgl.camera.zoom);
			this._libraryInterface.configuration.webgl.camera.zoom = Math.max(0.001, this._libraryInterface.configuration.webgl.camera.zoom);
			if (this.onChange)
				this.onChange();
		});

		const KEY_W = 119;
		const KEY_S = 115;
		const KEY_D = 100;
		const KEY_A = 97;
		const KEY_PLUS = 43;
		const KEY_MINUS = 45;
		document.addEventListener('keypress', event => {
			if (KEY_W === event.keyCode) {
				if (this.onForward) {
					this.onForward(this._mouseSensitivity);
				}
			} else if (KEY_S === event.keyCode) {
				if (this.onBackward) {
					this.onBackward(this._mouseSensitivity);
				}
			} else if (KEY_D === event.keyCode) {
				if (this.onRight) {
					this.onRight(this._mouseSensitivity);
				}
			} else if (KEY_A === event.keyCode) {
				if (this.onLeft) {
					this.onLeft(this._mouseSensitivity);
				}
			} else if (KEY_PLUS === event.keyCode) {
				this._libraryInterface.configuration.webgl.camera.zoom -= this._zoomSensitivity * 300;
				if (this.onChange)
					this.onChange();
			} else if (KEY_MINUS === event.keyCode) {
				this._libraryInterface.configuration.webgl.camera.zoom += this._zoomSensitivity * 300;
				if (this.onChange)
					this.onChange();
			}
		});
	}

	get zoomSensitivity() {
		return this._zoomSensitivity;
	}

	get mouseSensitivity() {
		return this._mouseSensitivity;
	}
}