import { Vector3D } from "../../vector3d";
import { IParticle } from "../../particle";
export interface IBoundaryObject {
    position: Vector3D;
    dimensions: Vector3D;
    contains(particle: IParticle): boolean;
    intersects(boundary: IBoundaryObject): boolean;
}
export declare enum QuadrantLocation {
    LEFT_TOP_FRONT = "leftTopFront",
    RIGHT_TOP_FRONT = "rightTopFront",
    LEFT_BOTTOM_FRONT = "leftBottomFront",
    RIGHT_BOTTOM_FRONT = "rightBottomFront",
    LEFT_TOP_BACK = "leftTopBack",
    RIGHT_TOP_BACK = "rightTopBack",
    LEFT_BOTTOM_BACK = "leftBottomBack",
    RIGHT_BOTTOM_BACK = "rightBottomBack"
}
export declare class Box implements IBoundaryObject {
    position: Vector3D;
    dimensions: Vector3D;
    constructor(position: Vector3D, dimensions: Vector3D);
    contains(particle: IParticle): boolean;
    intersects(boundary: IBoundaryObject): boolean;
}
export declare class QuadTree {
    boundary: Box;
    private _capacity;
    private _particles;
    private _subdivided;
    private _quadrants;
    constructor(boundary: Box, _capacity?: number);
    insert(particle: IParticle): boolean;
    query(boundary: Box, foundParticles?: IParticle[]): IParticle[];
    getQuadrants(): {
        leftTopFront?: QuadTree;
        rightTopFront?: QuadTree;
        leftBottomFront?: QuadTree;
        rightBottomFront?: QuadTree;
        leftTopBack?: QuadTree;
        rightTopBack?: QuadTree;
        leftBottomBack?: QuadTree;
        rightBottomBack?: QuadTree;
    };
    private _subdivide;
}
