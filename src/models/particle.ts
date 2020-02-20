import { IVector3D, Vector3D } from "./vector3d";
import { Vector4D, IVector4D } from "./vector4d";
import { ParticleSector, IParticleSector } from "./particle-sector";
import { ILibraryInterface } from "../main";

// Represents the parameter and the methods required by the particle
// to move through the available space.
// It uses coordinates for the current tick (*i.e.* frame),
// and a velocity, which automatically increments the coords accordingly.
export interface IMoveable {
    coords    : IVector3D;
    // Change in position in one unit of time (*i.e.* 16ms)
    velocity  : IVector3D;
    sector    : IVector3D;

    updatePosition(): void;
    getAdjacentSectors(): IParticleSector[];
}

// Contains the properties required by the particle
// to be drawn onto the scene.
export interface IDrawable {
    size : number;
    color: IVector4D;
}

export interface IListenable {
    onPositionUpdate?: (particle: IParticle) => any;
}

export interface IParticle extends IMoveable, IDrawable, IListenable {
    
}

export class Particle implements IParticle {
    
    constructor(public coords: Vector3D = new Vector3D(), private _manager: ILibraryInterface) {}

    size     : number    = 2;
    velocity : Vector3D  = new Vector3D({ x: .1, y: .1, z: 0});
    color    : IVector4D = new Vector4D({
        x: 255,
        y: 255,
        z: 255,
        w: 1
    });
    onPositionUpdate?: (particle: IParticle) => any;

    sector: IParticleSector;

    // Updates position according to velocity
    updatePosition() {
        if (this.velocity) {
            this.coords.add(this.velocity);
        }
        this._notifyUpdate();
    }

    private _notifyUpdate() {
        if (this.onPositionUpdate) {
            this.onPositionUpdate(this);
        }
    }

    getAdjacentSectors(): IParticleSector[] {
        return this.sector.getAdjacentSectors();
    }
}
