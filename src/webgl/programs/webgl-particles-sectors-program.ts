import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import { IParticle } from "../../models/particle";
import { Vector3D } from "../../models/vector3d";
import { Vector4D } from "../../models/vector4d";
import { getColor } from "../../rendering/renderer-webgl";
import { particlesSectorsVSText } from "./shaders/particles/particles-sectors.vs";
import { particlesSectorsFSText } from "./shaders/particles/particles-sectors.fs";
import { ParticleSectorManager } from "../../models/particle-sector-manager";

enum Attr {
	POSITION = 'v_pos', // Vector of 3
	// COLOR    = 'v_col', // Vector of 4
}

enum Uni {
	RESOLUTION = 'v_res',
	WORLD      = 'm_world',
	VIEW       = 'm_view',
	PROJECTION = 'm_projection',
	T          = 'f_t',
}

export enum UpdateableParam {
    CAMERA = 'cam',
    RESOLUTION = 'res',
}

export class ParticlesSectorsProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array;

    constructor(
        private _gl: WebGLRenderingContext,
        private _viewBox: ViewBox
    ) {}

    notifyParamChange(param: UpdateableParam) {
        this._willUpdateParams[param] = true;
    }

    get resolutionVector() {
        return this._viewBox.resolutionVec;
    }

    init(sectorsManager: ParticleSectorManager) {

        const sectorLength = sectorsManager.sectorLength;

        const lengthByCoord = (n: number) => {
            return n * sectorLength;
        }

        this._vertices = new Float32Array(sectorsManager
            .getAllSectors()
            .filter((_, i) => i < 3)
            .reduce((accumulator, sector) => {

                const {x, y, z} = sector;

                return accumulator.concat([
                    // bottom
                    lengthByCoord(x), lengthByCoord(y), lengthByCoord(z),
                    // 1, 1, 1, 1,
                    lengthByCoord(x+1), lengthByCoord(y), lengthByCoord(z),
                    // 1, 1, 1, 1,

                    // right
                    lengthByCoord(x) + sectorLength, lengthByCoord(y), lengthByCoord(z),
                    // // 1, 1, 1, 1,
                    lengthByCoord(x) + sectorLength, lengthByCoord(y) + sectorLength, lengthByCoord(z),
                    // // 1, 1, 1, 1,

                    // // top
                    lengthByCoord(x) + sectorLength, lengthByCoord(y) + sectorLength, lengthByCoord(z),
                    // // 1, 1, 1, 1,
                    lengthByCoord(x), lengthByCoord(y) + sectorLength, lengthByCoord(z),
                    // // 1, 1, 1, 1,

                    // // left
                    lengthByCoord(x), lengthByCoord(y) + sectorLength, lengthByCoord(z),
                    // // 1, 1, 1, 1,
                    lengthByCoord(x), lengthByCoord(y), lengthByCoord(z),
                    // 1, 1, 1, 1,
                ]);
            }, []));
        console.log(this._vertices);

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            particlesSectorsVSText,
            particlesSectorsFSText,
            Object.values(Attr),
            Object.values(Uni),
        );
        this._gl.useProgram(this._programContainer.program);

        this._vectorsBuffer = this._gl.createBuffer();
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		// this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
    }

    update(deltaT: number, T: number): void {

        this._gl.useProgram(this._programContainer.program);
        this._gl.uniform1f(this._programContainer.uni(Uni.T), T);

        if (this._willUpdateParams[UpdateableParam.RESOLUTION]) {
            this._gl.uniform3fv(this._programContainer.uni(Uni.RESOLUTION), new Float32Array(this.resolutionVector));
            this._willUpdateParams[UpdateableParam.RESOLUTION] = false;
        }

        if (this._willUpdateParams[UpdateableParam.CAMERA]) {
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.VIEW), false, this._viewBox.vMat);
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.PROJECTION), false, this._viewBox.pMat);
            this._willUpdateParams[UpdateableParam.CAMERA] = false;
        }

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION),
            3,
            this._gl.FLOAT,
            false,
            3 * Float32Array.BYTES_PER_ELEMENT,
            0,
        );
    }

    draw() {
        this._gl.useProgram(this._programContainer.program);
        this._gl.drawArrays(this._gl.POINTS, 0, this._vertices.length / 3);
    }
}