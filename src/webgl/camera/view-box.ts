import { mat4 } from "gl-matrix";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";

export class ViewBox {

	public wMat = mat4.create();
	public vMat = mat4.create();
	public pMat = mat4.create();

	constructor(
		private _library: IWebGLLibraryInterface
	) {
		this.calculate();
	}

	calculate() {

		const { width, height, webgl } = this._library.configuration;
		const { enabled, pitch, yaw, zoom, ortho, fov } = webgl.camera;

		if (enabled) {
			//#region Camera matrix (view matrix)
			const cameraMatrix = mat4.rotateY(mat4.create(), mat4.create(), pitch);
			mat4.rotateX(cameraMatrix, cameraMatrix, yaw);
			mat4.translate(cameraMatrix, cameraMatrix, [0, 0, zoom]);

			const target = [0, 0, 0];
			const eye = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
			const up = [0, 1, 0];

			mat4.lookAt(this.vMat, eye, target, up);

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