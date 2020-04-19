import { IProximityDetectionSystem } from "../proximity-detection-system";
import { IParticle } from "../../particle";
import { QuadTree, Box } from "./quad-tree";
import { ILibraryInterface } from "../../../main";
import { Vector3D } from "../../vector3d";

export class QuadTreeProximityDetectionSystem implements IProximityDetectionSystem {

    constructor(private _manager: ILibraryInterface) {}

    quadTree: QuadTree | null = null;

    init(): void {
        
    }

    update(objects: IParticle[]): void {

        const { width, height, depth } = this._manager.configuration;

        const position = new Vector3D({ x: width / 2, y: height / 2, z: depth / 2 });
        const dimensions = position.clone();
        const boundary = new Box(position, dimensions);
        const quadTree = new QuadTree(boundary);

        objects.forEach(o => quadTree.insert(o));

        this.quadTree = quadTree;
    }

    getNeighbours(object: IParticle, radius: number = 200): IParticle[] {

        const position = (object.coords as Vector3D).clone();
        const dimensions = new Vector3D({ x: radius, y: radius, z: radius });

        const possibleNeighbours = this.quadTree.query(new Box(position, dimensions));

        const neighbours = possibleNeighbours
            .filter(n => this._getDistance(object, n) < radius);
        return neighbours;
    }

    private _getDistance(obj1: IParticle, obj2: IParticle) {
        return Math.hypot(
            obj2.coords.x - obj1.coords.x,
            obj2.coords.y - obj1.coords.y,
            obj2.coords.z - obj1.coords.z,
        );
    }

}