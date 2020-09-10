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
	private _zoomSensitivity = .005;

	public onChange    : () => any;
	public onForward   : ((sensitivity: number) => any) | null;
	public onBackward  : ((sensitivity: number) => any) | null;
	public onRight     : ((sensitivity: number) => any) | null;
	public onLeft      : ((sensitivity: number) => any) | null;

	bind(
		canvas: HTMLCanvasElement
	) {
		const camera = this._libraryInterface.configuration.webgl.camera;

		if (camera.locked) return;

		document.body.style.touchAction = "none";

		let pointerEvents: PointerEvent[] = [];
		let prevPointerDiff = -1;
		let isPinchZooming = false;

		const pointerDownHandler = (event: PointerEvent) => {
			pointerEvents.push(event);
			isPinchZooming = pointerEvents.length === 2;
		};
		const pointerMoveHandler = (event: PointerEvent) => {
			for (let i = 0; i < pointerEvents.length; i++) {
				if (event.pointerId === pointerEvents[i].pointerId) {
					pointerEvents[i] = event;
					break;
				}
			}

			if (pointerEvents.length === 2) {
				const currentPointerDiff = Math.hypot(
					pointerEvents[1].clientX - pointerEvents[0].clientX,
					pointerEvents[1].clientY - pointerEvents[0].clientY);

				if (prevPointerDiff > 0) {
					if (currentPointerDiff > prevPointerDiff) {
						camera.zoom.value -= currentPointerDiff * this._zoomSensitivity * .1;
					}
					if (currentPointerDiff < prevPointerDiff) {
						camera.zoom.value += currentPointerDiff * this._zoomSensitivity * .1;
					}

					camera.zoom.value = Math.min(10, camera.zoom.value);
						camera.zoom.value = Math.max(0.001, camera.zoom.value);
						if (this.onChange)
							this.onChange();
				}
				prevPointerDiff = currentPointerDiff;
			}
		};
		const pointerUpHandler = (event: PointerEvent) => {
			pointerEvents = pointerEvents
				.filter(x => x.pointerId !== event.pointerId);
			if (pointerEvents.length < 2)
				prevPointerDiff = -1;
			isPinchZooming = pointerEvents.length === 2;
		};

		canvas.addEventListener('pointerdown', pointerDownHandler);
		canvas.addEventListener('pointermove', pointerMoveHandler);
		canvas.addEventListener('pointerup', pointerUpHandler);
		canvas.addEventListener('pointercancel', pointerUpHandler);
		canvas.addEventListener('pointerout', pointerUpHandler);
		canvas.addEventListener('pointerleave', pointerUpHandler);

		const getXY = (event: MouseEvent | TouchEvent) => {
			if ('x' in event)
				return {x: event.x, y: event.y};
			return {x: event.touches[0].clientX, y: event.touches[0].clientY};
		}

		const mouseDownHandler = (event: MouseEvent) => {
			const {x, y} = getXY(event);
			this._lastMouseX = x;
			this._lastMouseY = y;
			this._isMouseDown = true;
		};
		const mouseMoveHandler = (event: MouseEvent) => {
			const {x, y} = getXY(event);
			event.preventDefault();
			if (isPinchZooming) return;
			if (this._isMouseDown) {
				this._currMouseX = x;
				this._currMouseY = y;
				let mouseMovX = (this._currMouseX - this._lastMouseX) * this._mouseSensitivity;
				let mouseMovY = (this._currMouseY - this._lastMouseY) * this._mouseSensitivity;
				this._lastMouseX = this._currMouseX;
				this._lastMouseY = this._currMouseY;

				let { pitch, yaw } = camera;

				pitch -= mouseMovX;
				yaw -= mouseMovY;

				yaw = Math.max(yaw, (-1 * (Math.PI / 2)) + .0001);
				yaw = Math.min(yaw, Math.PI / 2);

				camera.pitch = pitch;
				camera.yaw = yaw;

				if (this.onChange)
					this.onChange();
				
			}
		};
		const mouseUpHandler = (event: MouseEvent) => {
			this._isMouseDown = false;
		}

		canvas.addEventListener('mousedown', mouseDownHandler);
		canvas.addEventListener('mouseup', mouseUpHandler);
		canvas.addEventListener('mousemove', mouseMoveHandler);
		canvas.addEventListener('mouseleave', mouseUpHandler);
		canvas.addEventListener('mouseout', mouseUpHandler);

		canvas.addEventListener('touchstart', mouseDownHandler);
		canvas.addEventListener('touchend', mouseUpHandler);
		canvas.addEventListener('touchmove', mouseMoveHandler);
		canvas.addEventListener('touchleave', mouseUpHandler);
		canvas.addEventListener('touchout', mouseUpHandler);
	
		if (!camera.zoom.locked) {
			canvas.addEventListener('wheel', event => {
				event.preventDefault();
				camera.zoom.value += event.deltaY * this._zoomSensitivity;
				camera.zoom.value = Math.min(10, camera.zoom.value);
				camera.zoom.value = Math.max(0.001, camera.zoom.value);
				if (this.onChange)
					this.onChange();
			});
		}

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
				if (!camera.zoom.locked) {
					camera.zoom.value -= this._zoomSensitivity * 100;
					camera.zoom.value = Math.max(camera.zoom.value, 1);
					
					if (this.onChange)
						this.onChange();
				}
			} else if (KEY_MINUS === event.keyCode) {
				if (!camera.zoom.locked) {
					camera.zoom.value += this._zoomSensitivity * 100;
					
					camera.zoom.value = Math.min(camera.zoom.value, 14);
					if (this.onChange)
						this.onChange();
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