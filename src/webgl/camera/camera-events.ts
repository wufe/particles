import { IWebGLLibraryInterface, TWebGLConfiguration } from "../../rendering/renderer-webgl";
import { TSubscription } from "../../utils/observable";
import { UpdatableParams } from "../../library-interface";

const radiansToDegrees = (r: number) => r * 180 / Math.PI;
const degreesToRadians = (d: number) => d * Math.PI / 180;

const KEY_W = 119;
const KEY_S = 115;
const KEY_D = 100;
const KEY_A = 97;
const KEY_PLUS = 43;
const KEY_MINUS = 45;

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
	private _zoomSensitivity = .005;

	private _camera: TWebGLConfiguration['camera'];

	private _pointerEvents: PointerEvent[] = [];
	private _prevPointerDiff = -1;
	private _isPinchZooming = false;


	public onChange    : () => any;
	public onForward   : ((sensitivity: number) => any) | null;
	public onBackward  : ((sensitivity: number) => any) | null;
	public onRight     : ((sensitivity: number) => any) | null;
	public onLeft      : ((sensitivity: number) => any) | null;

	private _cameraMouseEventsBound = false;
	private _cameraKeyboardEventsBound = false;
	private _cameraWheelEventsBound = false;

	private _updatableParamsSubscription: TSubscription<UpdatableParams['camera']> | null = null;

	bind = (canvas: HTMLCanvasElement) => {
		this._camera = this._libraryInterface.configuration.webgl.camera;

		if (!this._camera.locked) {
			if (!this._cameraMouseEventsBound) {
				canvas.style.touchAction = "none";

				canvas.addEventListener('pointerdown', this.pointerDownHandler);
				canvas.addEventListener('pointermove', this.pointerMoveHandler);
				canvas.addEventListener('pointerup', this.pointerUpHandler);
				canvas.addEventListener('pointercancel', this.pointerUpHandler);
				canvas.addEventListener('pointerout', this.pointerUpHandler);
				canvas.addEventListener('pointerleave', this.pointerUpHandler);

				canvas.addEventListener('mousedown', this.mouseDownHandler);
				canvas.addEventListener('mouseup', this.mouseUpHandler);
				canvas.addEventListener('mousemove', this.mouseMoveHandler);
				canvas.addEventListener('mouseleave', this.mouseUpHandler);
				canvas.addEventListener('mouseout', this.mouseUpHandler);

				canvas.addEventListener('touchstart', this.mouseDownHandler);
				canvas.addEventListener('touchend', this.mouseUpHandler);
				canvas.addEventListener('touchmove', this.mouseMoveHandler);
				canvas.addEventListener('touchleave', this.mouseUpHandler);
				canvas.addEventListener('touchout', this.mouseUpHandler);

				this._cameraMouseEventsBound = true;
			}

			if (!this._cameraWheelEventsBound) {
				if (!this._camera.zoom.locked) {
					canvas.addEventListener('wheel', this.mouseWheelHandler);
					this._cameraWheelEventsBound = true;
				}
			} else { // this._cameraWheelEventsBound
				if (this._camera.zoom.locked) {
					canvas.removeEventListener('wheel', this.mouseWheelHandler);
					this._cameraWheelEventsBound = false;
				}
			}

			if (!this._cameraKeyboardEventsBound) {
				document.addEventListener('keypress', this.keyPressHandler);
				this._cameraKeyboardEventsBound = true;
			}
		} else { // this._camera.locked
			if (this._cameraMouseEventsBound) {
				canvas.style.touchAction = "";

				canvas.removeEventListener('pointerdown', this.pointerDownHandler);
				canvas.removeEventListener('pointermove', this.pointerMoveHandler);
				canvas.removeEventListener('pointerup', this.pointerUpHandler);
				canvas.removeEventListener('pointercancel', this.pointerUpHandler);
				canvas.removeEventListener('pointerout', this.pointerUpHandler);
				canvas.removeEventListener('pointerleave', this.pointerUpHandler);

				canvas.removeEventListener('mousedown', this.mouseDownHandler);
				canvas.removeEventListener('mouseup', this.mouseUpHandler);
				canvas.removeEventListener('mousemove', this.mouseMoveHandler);
				canvas.removeEventListener('mouseleave', this.mouseUpHandler);
				canvas.removeEventListener('mouseout', this.mouseUpHandler);

				canvas.removeEventListener('touchstart', this.mouseDownHandler);
				canvas.removeEventListener('touchend', this.mouseUpHandler);
				canvas.removeEventListener('touchmove', this.mouseMoveHandler);
				canvas.removeEventListener('touchleave', this.mouseUpHandler);
				canvas.removeEventListener('touchout', this.mouseUpHandler);

				this._cameraMouseEventsBound = false;
			}

			if (this._cameraWheelEventsBound) {
				canvas.removeEventListener('wheel', this.mouseWheelHandler);
				this._cameraWheelEventsBound = false;
			}

			if (this._cameraKeyboardEventsBound) {
				document.removeEventListener('keypress', this.keyPressHandler);
				this._cameraKeyboardEventsBound = false;
			}
		}

		if (!this._updatableParamsSubscription)
			this._updatableParamsSubscription =
				this._libraryInterface.updatableParamsObservable
					.partialSubscribe<UpdatableParams['camera']>('camera', () => this.bind(this._libraryInterface.canvas));
	}

	getXY = (event: MouseEvent | TouchEvent) => {
		if ('x' in event)
			return { x: event.x, y: event.y };
		return { x: event.touches[0].clientX, y: event.touches[0].clientY };
	}

	pointerDownHandler = (event: PointerEvent) => {
		this._pointerEvents.push(event);
		this._isPinchZooming = this._pointerEvents.length === 2;
	};

	pointerMoveHandler = (event: PointerEvent) => {
		for (let i = 0; i < this._pointerEvents.length; i++) {
			if (event.pointerId === this._pointerEvents[i].pointerId) {
				this._pointerEvents[i] = event;
				break;
			}
		}

		if (this._pointerEvents.length === 2) {
			const currentPointerDiff = Math.hypot(
				this._pointerEvents[1].clientX - this._pointerEvents[0].clientX,
				this._pointerEvents[1].clientY - this._pointerEvents[0].clientY);

			if (this._prevPointerDiff > 0) {
				if (currentPointerDiff > this._prevPointerDiff) {
					this._camera.zoom.value -= currentPointerDiff * this._zoomSensitivity * .1;
				}
				if (currentPointerDiff < this._prevPointerDiff) {
					this._camera.zoom.value += currentPointerDiff * this._zoomSensitivity * .1;
				}

				this._camera.zoom.value = Math.min(10, this._camera.zoom.value);
				this._camera.zoom.value = Math.max(0.001, this._camera.zoom.value);
				if (this.onChange)
					this.onChange();
			}
			this._prevPointerDiff = currentPointerDiff;
		}
	};

	pointerUpHandler = (event: PointerEvent) => {
		this._pointerEvents = this._pointerEvents
			.filter(x => x.pointerId !== event.pointerId);
		if (this._pointerEvents.length < 2)
			this._prevPointerDiff = -1;
		this._isPinchZooming = this._pointerEvents.length === 2;
	};

	mouseDownHandler = (event: MouseEvent) => {
		const { x, y } = this.getXY(event);
		this._lastMouseX = x;
		this._lastMouseY = y;
		this._isMouseDown = true;
	};

	mouseMoveHandler = (event: MouseEvent) => {
		const { x, y } = this.getXY(event);
		event.preventDefault();
		if (this._isPinchZooming) return;
		if (this._isMouseDown) {
			this._currMouseX = x;
			this._currMouseY = y;
			let mouseMovX = (this._currMouseX - this._lastMouseX) * this._mouseSensitivity;
			let mouseMovY = (this._currMouseY - this._lastMouseY) * this._mouseSensitivity;
			this._lastMouseX = this._currMouseX;
			this._lastMouseY = this._currMouseY;

			let { pitch, yaw } = this._camera;

			pitch -= mouseMovX;
			yaw -= mouseMovY;

			yaw = Math.max(yaw, (-1 * (Math.PI / 2)) + .0001);
			yaw = Math.min(yaw, Math.PI / 2);

			this._camera.pitch = pitch;
			this._camera.yaw = yaw;

			if (this.onChange)
				this.onChange();

		}
	};

	mouseUpHandler = (event: MouseEvent) => {
		this._isMouseDown = false;
	}

	mouseWheelHandler = (event: WheelEvent) => {
		event.preventDefault();
		this._camera.zoom.value += event.deltaY * this._zoomSensitivity;
		this._camera.zoom.value = Math.min(10, this._camera.zoom.value);
		this._camera.zoom.value = Math.max(0.001, this._camera.zoom.value);
		if (this.onChange)
			this.onChange();
	}

	keyPressHandler = (event: KeyboardEvent) => {
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
			if (!this._camera.zoom.locked) {
				this._camera.zoom.value -= this._zoomSensitivity * 100;
				this._camera.zoom.value = Math.max(this._camera.zoom.value, 1);

				if (this.onChange)
					this.onChange();
			}
		} else if (KEY_MINUS === event.keyCode) {
			if (!this._camera.zoom.locked) {
				this._camera.zoom.value += this._zoomSensitivity * 100;

				this._camera.zoom.value = Math.min(this._camera.zoom.value, 14);
				if (this.onChange)
					this.onChange();
			}
		}
	}

	get zoomSensitivity() {
		return this._zoomSensitivity;
	}

	get mouseSensitivity() {
		return this._mouseSensitivity;
	}
}