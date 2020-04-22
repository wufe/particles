import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import directionsVertexShader from "./shaders/directions/directions.vert";
import directionsFragmentShader from "./shaders/directions/directions.frag";
import { BaseProgram } from "./base-webgl-program";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";

enum Attr {
    POSITION = 'v_pos',
    COLOR    = 'v_col'
}

export class DirectionsProgram extends BaseProgram<Attr> implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _vertices: Float32Array;
    private _strideLength = 7;

    constructor(
        gl: WebGLRenderingContext,
        viewBox: ViewBox,
        libraryInterface: IWebGLLibraryInterface,
    ) {
        super(
            gl,
            directionsVertexShader,
            directionsFragmentShader,
            Object.values(Attr),
            Object.values({}),
            viewBox,
            libraryInterface
        );
    }

    init() {
        this._buildVertices();

        this._vectorsBuffer = this._gl.createBuffer();
    }

    private _buildVertices() {
        this._vertices = new Float32Array([
            // x
            0, 0, 0,
            1, .3, .3, 1,
            .3, 0, 0,
            1, .3, .3, .2,
            // y
            0, 0, 0,
            .3, 1, .3, 1,
            0, .3, 0,
            .3, 1, .3, .2,
            //z
            0, 0, 0,
            .3, .3, 1, 1,
            0, 0, .3,
            .3, .3, 1, .2,

            -1, -1, -1,
            1, .3, .3, .3,
            1, -1, -1,
            1, .3, .3, .3,

            -1, -1, 1,
            1, .3, .3, .3,
            1, -1, 1,
            1, .3, .3, .3,

            -1, 1, -1,
            1, .3, .3, .3,
            1, 1, -1,
            1, .3, .3, .3,

            -1, 1, 1,
            1, .3, .3, .3,
            1, 1, 1,
            1, .3, .3, .3,
        ]);
    }

    draw(deltaT: number, T: number) {
        super.draw(deltaT, T);

        this._gl.enableVertexAttribArray(this.attr(Attr.POSITION));
		this._gl.enableVertexAttribArray(this.attr(Attr.COLOR));

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

        this._gl.vertexAttribPointer(
			this.attr(Attr.COLOR),
			4,
			this._gl.FLOAT,
			false,
			this._strideLength * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT,
		);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._strideLength);


        this._gl.disableVertexAttribArray(this.attr(Attr.POSITION));
        this._gl.disableVertexAttribArray(this.attr(Attr.COLOR));

    }
}