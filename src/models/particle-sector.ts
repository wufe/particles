import { Vector3D, IVector3D, ZeroVector3D } from "./vector3d";

export interface IParticleSector extends IVector3D {
    getAdjacentSectors: () => IParticleSector[];
    addAdjacentSector: (sector: IParticleSector) => void;
}

export class ParticleSector extends Vector3D implements IParticleSector {

    private _adjacentSectors: IParticleSector[] = [];

    constructor(_vec: IVector3D = { ...ZeroVector3D }) {
        super(_vec);
    }

    addAdjacentSector(sector: IParticleSector) {
        this._adjacentSectors.push(sector);
    }

    getAdjacentSectors(): IParticleSector[] {
        return this._adjacentSectors;
    }
}