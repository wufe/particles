import { IParticleSector } from "./particle-sector";
export declare class ParticleSectorManager {
    width: number;
    height: number;
    depth: number;
    sectorLength: number;
    zSectorsCount: number;
    ySectorsCount: number;
    xSectorsCount: number;
    private _sectors;
    constructor(width: number, height: number, depth: number);
    private _initSectors;
    getSectorByIndex(x: number, y: number, z: number): IParticleSector;
    getAllSectors(): IParticleSector[];
}
