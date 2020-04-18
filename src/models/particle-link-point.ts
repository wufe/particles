import { Particle, IParticle } from "./particle";
import { ParticleEventType } from "./base-particle";
import { ListenableDispatcher, IListenable } from "./listenable";
import { IVector3D } from "./vector3d";
import { IVector4D } from "./vector4d";

export enum ParticleLineEventType {
    UPDATE = 'update',
}

export interface IParticleLinkPoint extends IListenable<IParticleLinkPoint, ParticleLineEventType> {
    position: IVector3D;
    color: IVector4D;
    distance: number;
}

export class ParticleLinkPoint extends ListenableDispatcher<IParticleLinkPoint, ParticleLineEventType> implements IParticleLinkPoint {
    constructor(public position: IVector3D, public color: IVector4D, public distance: number) {
        super();
    }

    notifyUpdated() {
        this.call(ParticleLineEventType.UPDATE, this);
    }
}