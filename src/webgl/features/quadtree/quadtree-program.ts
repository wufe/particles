import { IProgram } from "../../programs/webgl-program";
import { ProgramContainer } from "../../programs/webgl-program-container";
import { ViewBox } from "../../camera/view-box";
import quadTreeVertexShader from "./shaders/quadtree.vert";
import quadTreeFragmentShader from "./shaders/quadtree.frag";
import { IWebGLLibraryInterface, getColor } from "../../../rendering/renderer-webgl";
import { QuadTree, IBoundaryObject } from "../../../models/proximity-detection/quad-tree/quad-tree";
import { BaseProgram } from "../../programs/base-webgl-program";
import { RecursivePartial, getDefault } from "../../../utils/object-utils";
import { QuadTreeProximityDetectionSystem } from "../../../models/proximity-detection/quad-tree/quad-tree-proximity-detection-system";

enum Attr {
    POSITION = 'v_pos',
}

enum Uni {
	COLOR = 'v_col',
}

type TQuadTreeProgramParams = {
    color: number[];
}

export class QuadTreeProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _vertices: Float32Array;
    private _quadTree: QuadTree | null;
    private _strideLength = 3;
    private _color: Float32Array;

    constructor(
        gl: WebGLRenderingContext,
        viewBox: ViewBox,
        libraryInterface: IWebGLLibraryInterface,
        private _params: TQuadTreeProgramParams
    ) {
        super(
            gl,
            quadTreeVertexShader,
            quadTreeFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
            viewBox,
            libraryInterface
        );
        console.log(quadTreeVertexShader)
    }

    private _getQuadTree() {
        return (this._libraryInterface.getProximityDetectionSystem() as QuadTreeProximityDetectionSystem).quadTree;
    }

    init() {
        const [r, g, b, a] = this._params.color;
        this._color = new Float32Array(getColor(r, g, b, a));
        this._vectorsBuffer = this._gl.createBuffer();
        this._updateQuadTree();
    }

    private _updateQuadTree() {
        const quadTree = this._getQuadTree();
        this._quadTree = quadTree;
        this._buildVertices();
    }

    update(deltaT: number, T: number) {
        super.update(deltaT, T);
        this._updateQuadTree();
    }

    private _buildVertices() {
        const boundaries = this._getBoundariesFromQuadTree(this._quadTree);
        this._vertices = new Float32Array(
            boundaries.map(({ position, dimensions }) => [
                // topLeftFront
                position.x - dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                // topRightFront
                position.x + dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                // topRightFront
                position.x + dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                // bottomRightFront
                position.x + dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // bottomRightFront
                position.x + dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // bottomLeftFront
                position.x - dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // bottomLeftFront
                position.x - dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // topLeftFront
                position.x - dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                
                // topLeftBack
                position.x - dimensions.x, position.y + dimensions.y, position.z - dimensions.z,
                // topRightBack
                position.x + dimensions.x, position.y + dimensions.y, position.z - dimensions.z,
                // topRightBack
                position.x + dimensions.x, position.y + dimensions.y, position.z - dimensions.z,
                // bottomRightBack
                position.x + dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
                // bottomRightBack
                position.x + dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
                // bottomLeftBack
                position.x - dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
                // bottomLeftBack
                position.x - dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
                // topLeftBack
                position.x - dimensions.x, position.y + dimensions.y, position.z - dimensions.z,

                // topLeftFront
                position.x - dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                // topLeftBack
                position.x - dimensions.x, position.y + dimensions.y, position.z - dimensions.z,
                // topRightFront
                position.x + dimensions.x, position.y + dimensions.y, position.z + dimensions.z,
                // topRightBack
                position.x + dimensions.x, position.y + dimensions.y, position.z - dimensions.z,
                // bottomRightFront
                position.x + dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // bottomRightBack
                position.x + dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
                // bottomLeftFront
                position.x - dimensions.x, position.y - dimensions.y, position.z + dimensions.z,
                // bottomLeftBack
                position.x - dimensions.x, position.y - dimensions.y, position.z - dimensions.z,
            ]).flat()
        );
    }

    private _getBoundariesFromQuadTree(root: QuadTree, boundaries: IBoundaryObject[] = []) {
        boundaries.push(root.boundary);
        for (const quadrant of Object.values(root.getQuadrants())) {
            this._getBoundariesFromQuadTree(quadrant, boundaries);
        }
        return boundaries;
    }

    draw(deltaT: number, T: number) {
        super.draw(deltaT, T);
        this._gl.uniform4fv(this.uni(Uni.COLOR), this._color)

        this._gl.enableVertexAttribArray(this.attr(Attr.POSITION));

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);

        this._gl.vertexAttribPointer(
            this.attr(Attr.POSITION),
            3,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            0,
        );
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._strideLength);

        this._gl.disableVertexAttribArray(this.attr(Attr.POSITION));
    }
}