import { IVector3D, Vector3D } from "./vector3d";
import { IVector4D, Vector4D } from "./vector4d";
import { isVector4D } from "./vector";

export class VectorNorm {
	constructor(private _vec: IVector3D | IVector4D) {}

	get euclidean() {
		return Math.hypot(...(this._vec as Vector3D | Vector4D).components);
	}
}