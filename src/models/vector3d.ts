import { VectorNorm } from "./vector-norm";

export interface IVector3D {
    x: number;
    y: number;
	z: number;
	components: number[];
}

export const ZeroVector3D = { x: 0, y: 0, z: 0 };

export class Vector3D {

	public x: number;
	public y: number;
	public z: number;
	protected norm: VectorNorm;

	constructor({x, y, z}: Pick<IVector3D, 'x' | 'y' | 'z'> = { ...ZeroVector3D }) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.norm = new VectorNorm(this);
	}

	get components() {
		return [ this.x, this.y, this.z ];
	}

	clone() {
		const {x, y, z} = this;
		return new Vector3D({ x, y, z });
	}

	add(vector: IVector3D): Vector3D;
	add(scalar: number): Vector3D
	add(vectorOrScalar: number | IVector3D): Vector3D {
		if (typeof vectorOrScalar === 'number') {
			this.x += vectorOrScalar;
			this.y += vectorOrScalar;
			this.z += vectorOrScalar;
		} else {
			this.x += vectorOrScalar.x;
			this.y += vectorOrScalar.y;
			this.z += vectorOrScalar.z;
		}
		return this;
	}
	
	sub(vector: IVector3D) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		return this;
	}

	div(scalar: number) {
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		checkVector(this);
		return this;
	}

	mul(scalar: number) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		checkVector(this);
		return this;
	}

	dot(vector: IVector3D) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	}

	// TODO: Verify
	angle(vector: Vector3D) {
		return Math.acos(this.dot(vector) / (this.length * vector.length));
	}

	get length() {
		return this.norm.euclidean;
	}

	unit() {
		if (this.length > .0001)
			return this.div(this.length);
		return {...ZeroVector3D};
	}

	cross(vector: IVector3D) {
		const { x, y, z } = this.clone();
		this.x = y * vector.z - z * vector.y;
		this.y = z * vector.x - x * vector.z;
		this.z = x * vector.y - y * vector.x;
		return this;
	}

	static fromArray(components: number[]) {
		const [x, y, z] = components;
		return new Vector3D({ x, y, z });
	}
}

function checkVector(vector: Vector3D) {
	if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z))
		debugger;
}