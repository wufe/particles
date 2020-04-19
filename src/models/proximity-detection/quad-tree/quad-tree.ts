import { IVector3D, Vector3D } from "../../vector3d";
import { IParticle } from "../../particle";

export interface IBoundaryObject {
    position: Vector3D;
    dimensions: Vector3D;
    contains(particle: IParticle): boolean;
    intersects(boundary: IBoundaryObject): boolean;
}

export enum QuadrantLocation {
    LEFT_TOP_FRONT = 'leftTopFront',
    RIGHT_TOP_FRONT = 'rightTopFront',
    LEFT_BOTTOM_FRONT = 'leftBottomFront',
    RIGHT_BOTTOM_FRONT = 'rightBottomFront',
    LEFT_TOP_BACK = 'leftTopBack',
    RIGHT_TOP_BACK = 'rightTopBack',
    LEFT_BOTTOM_BACK = 'leftBottomBack',
    RIGHT_BOTTOM_BACK = 'rightBottomBack',
}

export class Box implements IBoundaryObject {
    constructor(public position: Vector3D, public dimensions: Vector3D) {}

    contains(particle: IParticle) {
        return !(
            this.position.x - this.dimensions.x >= particle.coords.x ||
            this.position.x + this.dimensions.x < particle.coords.x ||
            this.position.y - this.dimensions.y >= particle.coords.y ||
            this.position.y + this.dimensions.y < particle.coords.y ||
            this.position.z - this.dimensions.z >= particle.coords.z ||
            this.position.z + this.dimensions.z < particle.coords.z
        );
    }

    intersects(boundary: IBoundaryObject) {
        return !(
            this.position.x - this.dimensions.x > boundary.position.x + boundary.dimensions.x ||
            this.position.x + this.dimensions.x < boundary.position.x - boundary.dimensions.x ||
            this.position.y - this.dimensions.y > boundary.position.y + boundary.dimensions.y ||
            this.position.y + this.dimensions.y < boundary.position.y - boundary.dimensions.y ||
            this.position.z - this.dimensions.z > boundary.position.z + boundary.dimensions.z ||
            this.position.z + this.dimensions.z < boundary.position.z - boundary.dimensions.z
        );
    }
}

export class QuadTree {

    private _particles: IParticle[] = [];
    private _subdivided = false;
    private _quadrants: {
        [k in QuadrantLocation]?: QuadTree;
    } = {};

    constructor(public boundary: Box, private _capacity = 4) {}

    insert(particle: IParticle) {

        if (!this.boundary.contains(particle))
            return false;

        if (this._particles.length < this._capacity) {
            this._particles.push(particle);
            return true;
        } else {
            if (!this._subdivided)
                this._subdivide();
            for (const quadrant of Object.values(this._quadrants)) {
                if (quadrant.insert(particle))
                    return true;
            }
        }
    }

    query(boundary: Box, foundParticles: IParticle[] = []) {
        if (!this.boundary.intersects(boundary))
            return foundParticles;
        for (const particle of this._particles)
            foundParticles.push(particle);
        if (this._subdivided)
            for (const quadrant of Object.values(this._quadrants))
                quadrant.query(boundary, foundParticles);
        return foundParticles;
    }

    getQuadrants() {
        return this._quadrants;
    }

    private _subdivide() {
        const dimensions = this.boundary.dimensions.clone().div(2);
        const {x, y, z} = this.boundary.position;
        // TODO: Remove dimensions.clone for each rectangle
        const leftTopFront     = new Box(new Vector3D({ x: x - dimensions.x, y: y + dimensions.y, z: z + dimensions.z }), dimensions.clone());
        const rightTopFront    = new Box(new Vector3D({ x: x + dimensions.x, y: y + dimensions.y, z: z + dimensions.z }), dimensions.clone());
        const leftBottomFront  = new Box(new Vector3D({ x: x - dimensions.x, y: y - dimensions.y, z: z + dimensions.z }), dimensions.clone());
        const rightBottomFront = new Box(new Vector3D({ x: x + dimensions.x, y: y - dimensions.y, z: z + dimensions.z }), dimensions.clone());
        const leftTopBack      = new Box(new Vector3D({ x: x - dimensions.x, y: y + dimensions.y, z: z - dimensions.z }), dimensions.clone());
        const rightTopBack     = new Box(new Vector3D({ x: x + dimensions.x, y: y + dimensions.y, z: z - dimensions.z }), dimensions.clone());
        const leftBottomBack   = new Box(new Vector3D({ x: x - dimensions.x, y: y - dimensions.y, z: z - dimensions.z }), dimensions.clone());
        const rightBottomBack  = new Box(new Vector3D({ x: x + dimensions.x, y: y - dimensions.y, z: z - dimensions.z }), dimensions.clone());

        this._quadrants.leftTopFront     = new QuadTree(leftTopFront, this._capacity);
        this._quadrants.rightTopFront    = new QuadTree(rightTopFront, this._capacity);
        this._quadrants.leftBottomFront  = new QuadTree(leftBottomFront, this._capacity);
        this._quadrants.rightBottomFront = new QuadTree(rightBottomFront, this._capacity);
        this._quadrants.leftTopBack      = new QuadTree(leftTopBack, this._capacity);
        this._quadrants.rightTopBack     = new QuadTree(rightTopBack, this._capacity);
        this._quadrants.leftBottomBack   = new QuadTree(leftBottomBack, this._capacity);
        this._quadrants.rightBottomBack  = new QuadTree(rightBottomBack, this._capacity);

        this._subdivided = true;
    }
}