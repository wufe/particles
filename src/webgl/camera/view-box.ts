import { mat4, ReadonlyVec3, vec4 } from "gl-matrix";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { IVector3D, Vector3D } from "../../models/vector3d";

export class IViewBox {
	wMat: Iterable<number>;
	vMat: Iterable<number>;
	pMat: Iterable<number>;
	eye: IVector3D;
	recalculate: () => void;
	getResolutionVector: () => number[];
}

export class ViewBox implements IViewBox{

	public wMat = mat4.create();
	public vMat = mat4.create();
	public pMat = mat4.create();
	public eye: Vector3D | null = null;

	constructor(
		private _library: IWebGLLibraryInterface
	) {
		this.calculate();
	}

	map(val: number, inMin: number, inMax: number, outMin: number, outMax: number) {
		return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	calculate() {

		const { width, height, webgl } = this._library.configuration;
		const { enabled, pitch, yaw, zoom, ortho, fov } = webgl.camera;

		if (enabled) {
			//#region Camera matrix (view matrix)
			const cameraMatrix = mat4.rotateY(mat4.create(), mat4.create(), pitch);
			mat4.rotateX(cameraMatrix, cameraMatrix, yaw);
			mat4.translate(cameraMatrix, cameraMatrix, [0, 0, zoom.value]);

			const target = [0, 0, 0] as ReadonlyVec3;
			const eye = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
			const up = [0, 1, 0] as ReadonlyVec3;

			
			mat4.lookAt(this.vMat, eye as any as ReadonlyVec3, target, up);
			
			this.eye = Vector3D.fromArray(eye);
			this.eye.x = this.map(this.eye.x, zoom.value * -1, zoom.value, -1, +1);
			this.eye.y = this.map(this.eye.y, zoom.value * -1, zoom.value, -1, +1);
			this.eye.z = this.map(this.eye.z, zoom.value * -1, zoom.value, -1, +1);

			// mat4.invert(this.vMat, cameraMatrix);
			//#endregion

			if (ortho)
				mat4.ortho(this.pMat, -1, 1, -1, 1, .000001, 15);
			else
				mat4.perspective(this.pMat, fov, width / height, .00001, 15);
		}
	}

	recalculate() {
		this.calculate();
	}

	getResolutionVector() {
		const { width, height, depth } = this._library.configuration;
		return [width, height, depth];
	}
}