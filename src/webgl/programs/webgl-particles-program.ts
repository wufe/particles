import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import { IParticle } from "../../models/particle";
import { particlesVSText } from "./shaders/particles/particles.vs";
import { particlesFSText } from "./shaders/particles/particles.fs";
import { Vector3D } from "../../models/vector3d";
import { Vector4D } from "../../models/vector4d";
import { getColor, IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { ParticleEventType } from "../../models/base-particle";

enum Attr {
	POSITION = 'v_pos',    // Vector of 3
	COLOR    = 'v_col',    // Vector of 4
	SIZE     = 'f_size',
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

export class ParticlesProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array;
    private _strideLength = 8;

    constructor(
        private _gl: WebGLRenderingContext,
        private _viewBox: ViewBox,
        private _libraryInterface: IWebGLLibraryInterface,
    ) {}

    notifyParamChange(param: UpdateableParam) {
        this._willUpdateParams[param] = true;
    }

    get resolutionVector() {
        return this._viewBox.resolutionVec;
    }

    init(particles: IParticle[]) {
        this.useParticles(particles);

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            particlesVSText,
            particlesFSText,
            Object.values(Attr),
            Object.values(Uni),
        );

        this._vectorsBuffer = this._gl.createBuffer();
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.SIZE));
    }

    useParticles(particles: IParticle[]) {
        this._vertices = new Float32Array(particles
            .reduce((accumulator, particle, index) => {
                particle.on(ParticleEventType.POSITION_UPDATE, this._onParticlePositionUpdate(index));
                const [x, y, z] = (particle.coords as Vector3D).components;
                const [r, g, b, a] = (particle.color as Vector4D).components;
                const [cx, cy, cz, cw] = getColor(r, g, b, a);
                return accumulator.concat([
                    x, y, z,
                    cx, cy, cz, cw,
                    particle.size
                ]);
            }, []));
    }

    private _onParticlePositionUpdate = (particleIndex: number) => (particle: IParticle) => {
        const startIndex = particleIndex * this._strideLength;
        this._vertices[startIndex] = particle.coords.x;
        this._vertices[startIndex+1] = particle.coords.y;
        this._vertices[startIndex+2] = particle.coords.z;
    }

    update(deltaT: number, T: number): void {
        this._willUpdateParams[UpdateableParam.CAMERA] = true;

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
    }

    draw() {
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

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.SIZE),
            1,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            7 * Float32Array.BYTES_PER_ELEMENT
        );
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.POINTS, 0, this._vertices.length / this._strideLength);
    }
}