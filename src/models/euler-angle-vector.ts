import { Vector3D } from "./vector3d";

export class EulerAngle extends Vector3D {
	constructor(private _angles: {
		pitch: number;
		yaw  : number;
		roll : number;
	}) {
		super({
			x: _angles.pitch,
			y: _angles.yaw,
			z: _angles.roll
		});
	}

	toVector(): Vector3D {
		const { x, y, z } = this;
		return new Vector3D({
			x: Math.cos(y) * Math.cos(x),
			y: Math.sin(y) * Math.cos(x),
			z: Math.sin(x)
		});
	}
}