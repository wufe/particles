import { IVector3D } from "./vector3d";
import { IParticleSector, ParticleSector } from "./particle-sector";

export class ParticleSectorManager {

    public sectorLength: number;
    public zSectorsCount: number;
    public ySectorsCount: number;
    public xSectorsCount: number;

    private _sectors: IParticleSector[] = [];

    constructor(public width: number, public height: number) {
        this.sectorLength = Math.min(width, height) / 6;
        this.zSectorsCount = Math.ceil(Math.min(width, height) / this.sectorLength);
        this.xSectorsCount = Math.ceil(width / this.sectorLength);
        this.ySectorsCount = Math.ceil(height / this.sectorLength);

        this._initSectors();
    }

    private _initSectors() {
        const start = performance.now();
        for (let x = 0; x < this.xSectorsCount; x++) {
            for (let y = 0; y < this.ySectorsCount; y++) {
                for (let z = 0; z < this.zSectorsCount; z++) {
                    this._sectors.push(new ParticleSector({ x, y, z }));
                }
            }
        }

        // Mapping adjacent sectors
        for (let x = 0; x < this.xSectorsCount; x++) {
            for (let y = 0; y < this.ySectorsCount; y++) {
                for (let z = 0; z < this.zSectorsCount; z++) {
                    const currentSector = this.getSectorByIndex(x, y, z);
                    for (let ax = Math.max(x-1, 0); ax < Math.min(this.xSectorsCount, x+2); ax++) {
                        for (let ay = Math.max(y-1, 0); ay < Math.min(this.xSectorsCount, y+2); ay++) {
                            for (let az = Math.max(y-1, 0); az < Math.min(this.xSectorsCount, z+2); az++) {
                                currentSector.addAdjacentSector(this.getSectorByIndex(ax, ay, az));
                            }
                        }
                    }
                }
            }
        }

        console.log('Finding adjacent sectors:', performance.now() - start);
    }

    getSectorByIndex(x: number, y: number, z: number): IParticleSector {
        return this._sectors.find(sector => sector.x === x && sector.y === y && sector.z === z);
    }

    getAllSectors() {
        return this._sectors;
    }
}