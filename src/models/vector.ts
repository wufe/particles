import { IVector3D } from "./vector3d"
import { IVector4D } from "./vector4d"

export const isVector4D = (v: IVector3D | IVector4D): v is IVector4D => {
    return (v as IVector4D).w !== undefined;
}