import { IVector3D } from "./vector3d";
import { IVector4D } from "./vector4d";
export declare class VectorNorm {
    private _vec;
    constructor(_vec: IVector3D | IVector4D);
    get euclidean(): number;
}
