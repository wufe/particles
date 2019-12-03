import { mat4 } from "gl-matrix";
import { EulerAngle } from "../../models/euler-angle-vector";

export class ViewBox {

	public wMat = mat4.create();
	public vMat = mat4.create();
	public pMat = mat4.create();

	public eulerAngle: EulerAngle = new EulerAngle({
		pitch: 0,
		roll: 0,
		yaw: 0
	});

	constructor(
		public width: number,
		public height: number,
		private _pitch: number,
		private _yaw: number,
	) {
		this.calculate();
	}

	calculate() {
		this.eulerAngle.x = this._pitch;
		this.eulerAngle.y = this._yaw;
		this.eulerAngle.z = 0;
		mat4.lookAt(this.vMat, this.eulerVec, [0, 0, 0], [0, 0, 1]);
		mat4.perspective(this.pMat, Math.PI / 4, this.width / this.height, .00001, 15);
	}

	recalculate() {
		this.calculate();
	}

	private _zoom = 4;
	get zoom() {
		return this._zoom;
	}

	set zoom(value: number) {
		this._zoom = value;
		this.recalculate();
	}

	get pitch() {
		return this._pitch;
	}

	set pitch(value: number) {
		this._pitch = value;
		this.recalculate();
	}

	get yaw() {
		return this._yaw;
	}

	set yaw(value: number) {
		this._yaw = value;
		this.recalculate();
	}

	get eulerVec() {
		return this.eulerAngle.toVector().mul(this._zoom).components;
	}

	get resolutionVec() {
		return [
			this.width,
			this.height,
			Math.min(this.width, this.height),
		]
	}
}