import { VectorNorm } from "./vector-norm";
import { IVector3D, Vector3D } from "./vector3d";
import { isVector4D } from "./vector";

export interface IVector4D extends IVector3D {
    w: number;
}

export const ZeroVector4D = { x: 0, y: 0, z: 0, w: 0 };

export class Vector4D extends Vector3D {

    public w: number;

	constructor(vec: Pick<IVector4D, 'x' | 'y' | 'z' | 'w'> = { ...ZeroVector4D }) {
		super(vec);
		this.w = vec.w;
	}

	get components() {
        return super.components.concat([ this.w ]);
	}

	clone() {
        const {x, y, z, w} = this;
		return new Vector4D({ x, y, z, w });
	}

	add(vector: IVector3D | IVector4D): Vector4D;
	add(scalar: number): Vector4D
	add(vectorOrScalar: number | IVector3D | IVector4D): Vector4D {
		if (typeof vectorOrScalar === 'number') {
            super.add(vectorOrScalar);
            this.w += vectorOrScalar;
		} else {
            super.add(vectorOrScalar as IVector3D);
            if (isVector4D(vectorOrScalar))
                this.w += vectorOrScalar.w;
		}
		return this;
	}
	
	sub(vector: IVector3D | IVector4D) {
        super.sub(vector as IVector3D);
        if (isVector4D(vector))
            this.w -= vector.w;
		return this;
	}

	div(scalar: number) {
		super.div(scalar);
		this.w /= scalar;
		checkVector(this);
		return this;
	}

	mul(scalar: number) {
		super.mul(scalar);
		this.w *= scalar;
		checkVector(this);
		return this;
	}

	get length() {
		return this.norm.euclidean;
	}

	unit() {
		return this.div(this.length);
	}

	cross(vector: IVector4D) {
		// TODO: Cross for 4D
		// const { x, y, z } = this.clone();
		// this.x = y * vector.z - z * vector.y;
		// this.y = z * vector.x - x * vector.z;
		// this.z = x * vector.y - y * vector.x;
		// return this;
		return super.cross(vector);
	}

	static fromArray(components: number[]) {
		const [x, y, z, w] = components;
		return new Vector4D({ x, y, z, w });
	}
}

function checkVector(vector: Vector4D) {
	if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z) || isNaN(vector.w))
		debugger;
}