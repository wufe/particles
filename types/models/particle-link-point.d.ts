import { ListenableDispatcher, IListenable } from "./listenable";
import { IVector3D } from "./vector3d";
import { IVector4D } from "./vector4d";
export declare enum ParticleLineEventType {
    UPDATE = "update"
}
export interface IParticleLinkPoint extends IListenable<IParticleLinkPoint, ParticleLineEventType> {
    position: IVector3D;
    color: IVector4D;
    positionNeighbour: IVector3D;
    maxDistance: number;
}
export declare class ParticleLinkPoint extends ListenableDispatcher<IParticleLinkPoint, ParticleLineEventType> implements IParticleLinkPoint {
    position: IVector3D;
    color: IVector4D;
    positionNeighbour: IVector3D;
    maxDistance: number;
    constructor(position: IVector3D, color: IVector4D, positionNeighbour: IVector3D, maxDistance: number);
    notifyUpdated(): void;
}
