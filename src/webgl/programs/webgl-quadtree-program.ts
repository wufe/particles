import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import quadTreeVertexShader from "./shaders/quadtree/quadtree.vert";
import quadTreeFragmentShader from "./shaders/quadtree/quadtree.frag";
import { IWebGLLibraryInterface, getColor } from "../../rendering/renderer-webgl";
import { QuadTree, IBoundaryObject } from "../../models/proximity-detection/quad-tree/quad-tree";

enum Attr {
    POSITION = 'v_pos',
}

enum Uni {
	RESOLUTION = 'v_res',
	WORLD      = 'm_world',
	VIEW       = 'm_view',
	PROJECTION = 'm_projection',
	T          = 'f_t',
	COLOR      = 'v_col',
}

export enum UpdateableQuadTreeProgramParam {
    CAMERA = 'cam',
    RESOLUTION = 'res',
}

export class QuadTreeProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableQuadTreeProgramParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array;
    private _quadTree: QuadTree | null;
    private _strideLength = 3;
    private _color: Float32Array;

    constructor(
        private _gl: WebGLRenderingContext,
        private _viewBox: ViewBox,
        private _libraryInterface: IWebGLLibraryInterface,
    ) {}

    notifyParamChange(param: UpdateableQuadTreeProgramParam) {
        this._willUpdateParams[param] = true;
    }

    getResolutionVector() {
        return this._viewBox.getResolutionVector();
    }

    init(quadTree: QuadTree) {

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            quadTreeVertexShader,
            quadTreeFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
        );
        const [r, g, b, a] = this._libraryInterface.params.quadtree.color;
        this._color = new Float32Array(getColor(r, g, b, a));
        this._vectorsBuffer = this._gl.createBuffer();
        this.useQuadTree(quadTree);
    }

    useQuadTree(quadTree: QuadTree) {
        this._quadTree = quadTree;
        this._buildVertices();
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

    update(deltaT: number, T: number): void {
        this._willUpdateParams[UpdateableQuadTreeProgramParam.CAMERA] = true;

        this._gl.useProgram(this._programContainer.program);
        this._gl.uniform1f(this._programContainer.uni(Uni.T), T);
        this._gl.uniform4fv(this._programContainer.uni(Uni.COLOR), this._color)

        if (this._willUpdateParams[UpdateableQuadTreeProgramParam.RESOLUTION]) {
            this._gl.uniform3fv(this._programContainer.uni(Uni.RESOLUTION), new Float32Array(this.getResolutionVector()));
            this._willUpdateParams[UpdateableQuadTreeProgramParam.RESOLUTION] = false;
        }

        if (this._willUpdateParams[UpdateableQuadTreeProgramParam.CAMERA]) {
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.VIEW), false, this._viewBox.vMat);
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.PROJECTION), false, this._viewBox.pMat);
            this._willUpdateParams[UpdateableQuadTreeProgramParam.CAMERA] = false;
        }        
    }

    draw() {
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));

        this._gl.useProgram(this._programContainer.program);

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION),
            3,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            0,
        );
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._strideLength);

        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
    }
}