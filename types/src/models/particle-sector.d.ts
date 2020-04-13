import { Vector3D, IVector3D } from "./vector3d";
export interface IParticleSector extends IVector3D {
    getAdjacentSectors: () => IParticleSector[];
    addAdjacentSector: (sector: IParticleSector) => void;
}
export declare class ParticleSector extends Vector3D implements IParticleSector {
    private _adjacentSectors;
    constructor(_vec?: IVector3D);
    addAdjacentSector(sector: IParticleSector): void;
    getAdjacentSectors(): IParticleSector[];
}
