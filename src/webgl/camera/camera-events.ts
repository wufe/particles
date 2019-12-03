import { ViewBox } from "./view-box";
import { EulerAngle } from "../../models/euler-angle-vector";

const radiansToDegrees = (r: number) => r * 180 / Math.PI;

const degreesToRadians = (d: number) => d * Math.PI / 180;

export class CameraEvents {
	constructor(
		private _gl: WebGLRenderingContext,
		private _viewBox: ViewBox,
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

				this._viewBox.pitch += mouseMovY;
				this._viewBox.yaw -= mouseMovX;
	
				const pitch = radiansToDegrees(this._viewBox.pitch);
	
				if (pitch > 89)
					this._viewBox.pitch = degreesToRadians(89);
				if (pitch < -89)
					this._viewBox.pitch = degreesToRadians(-89);
				if (this.onChange)
					this.onChange();
				
			}
		});
	
		canvas.addEventListener('wheel', event => {
			this._viewBox.zoom += event.deltaY * this._zoomSensitivity;
			this._viewBox.zoom = Math.min(10, this._viewBox.zoom);
			this._viewBox.zoom = Math.max(0.001, this._viewBox.zoom);
			if (this.onChange)
				this.onChange();
		});

		const KEY_W = 119;
		const KEY_S = 115;
		const KEY_D = 100;
		const KEY_A = 97;
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