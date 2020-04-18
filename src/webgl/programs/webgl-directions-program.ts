import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import directionsVertexShader from "./shaders/directions/directions.vert";
import directionsFragmentShader from "./shaders/directions/directions.frag";

enum Attr {
    POSITION = 'v_pos',
    COLOR    = 'v_col'
}

enum Uni {
	RESOLUTION      = 'v_res',
	WORLD           = 'm_world',
	VIEW            = 'm_view',
	PROJECTION      = 'm_projection',
	T               = 'f_t',
}

export enum UpdateableDirectionsProgramParam {
    CAMERA = 'cam',
    RESOLUTION = 'res',
}

export class DirectionsProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableDirectionsProgramParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array;
    private _strideLength = 7;

    constructor(
        private _gl: WebGLRenderingContext,
        private _viewBox: ViewBox,
    ) {}

    notifyParamChange(param: UpdateableDirectionsProgramParam) {
        this._willUpdateParams[param] = true;
    }

    getResolutionVector() {
        return this._viewBox.getResolutionVector();
    }

    init() {
        this._buildVertices();

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            directionsVertexShader,
            directionsFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
        );

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
        ]);
    }

    update(deltaT: number, T: number): void {
        this._willUpdateParams[UpdateableDirectionsProgramParam.CAMERA] = true;

        this._gl.useProgram(this._programContainer.program);
        this._gl.uniform1f(this._programContainer.uni(Uni.T), T);

        if (this._willUpdateParams[UpdateableDirectionsProgramParam.RESOLUTION]) {
            this._gl.uniform3fv(this._programContainer.uni(Uni.RESOLUTION), new Float32Array(this.getResolutionVector()));
            this._willUpdateParams[UpdateableDirectionsProgramParam.RESOLUTION] = false;
        }

        if (this._willUpdateParams[UpdateableDirectionsProgramParam.CAMERA]) {
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.VIEW), false, this._viewBox.vMat);
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.PROJECTION), false, this._viewBox.pMat);
            this._willUpdateParams[UpdateableDirectionsProgramParam.CAMERA] = false;
        }        
    }

    draw() {
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.COLOR));

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

        this._gl.vertexAttribPointer(
			this._programContainer.attr(Attr.COLOR),
			4,
			this._gl.FLOAT,
			false,
			this._strideLength * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT,
		);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._strideLength);

        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
    }
}