import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import { IParticle } from "../../models/particle";
import particlesVertexShader from "./shaders/particles/particles.vert";
import particlesFragmentShader from "./shaders/particles/particles.frag";
import { Vector3D } from "../../models/vector3d";
import { Vector4D } from "../../models/vector4d";
import { getColor, IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { ParticleEventType } from "../../models/base-particle";

enum Attr {
	POSITION                            = 'v_pos',
	COLOR                               = 'v_col',
    SIZE                                = 'f_size',
    
    // Position transition
	POSITION_TRANSITION_ENABLED         = 't_position_enabled',
	POSITION_TRANSITION_START           = 't_position_start',
	POSITION_TRANSITION_END             = 't_position_end',
	POSITION_TRANSITION_START_TIME      = 't_position_start_time',
	POSITION_TRANSITION_END_TIME        = 't_position_end_time',
	POSITION_TRANSITION_EASING_FUNCTION = 't_position_easing_function',
}

enum Uni {
	RESOLUTION     = 'v_res',
	WORLD          = 'm_world',
	VIEW           = 'm_view',
	PROJECTION     = 'm_projection',
	EYE            = 'v_eye',
	T              = 'f_t',
	DEPTH_OF_FIELD = 'f_dof',
}

export enum UpdateableParticlesProgramParam {
    CAMERA = 'cam',
    RESOLUTION = 'res',
}

export class ParticlesProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableParticlesProgramParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array;
    private _strideLength = 18;

    constructor(
        private _gl: WebGLRenderingContext,
        private _viewBox: ViewBox,
        private _libraryInterface: IWebGLLibraryInterface,
    ) {}

    notifyParamChange(param: UpdateableParticlesProgramParam) {
        this._willUpdateParams[param] = true;
    }

    getResolutionVector() {
        return this._viewBox.getResolutionVector();
    }

    init(particles: IParticle[]) {
        this.useParticles(particles);

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            particlesVertexShader,
            particlesFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
        );

        this._vectorsBuffer = this._gl.createBuffer();
    }

    useParticles(particles: IParticle[]) {
        this._emptyEventAttachedParticles();
        this._vertices = new Float32Array(particles
            .map((particle, index) => {
                const [x, y, z] = particle.coords.components;
                const [r, g, b, a] = particle.color.components;
                const transition = particle.getTransitionSpecification();
                if (transition.enabled && !transition.committed)
                    throw new Error('Particle transition have not been commited.');
                this._attachParticleUpdateEventHandler(index, particle);
                return [
                    x, y, z,
                    r, g, b, a,
                    particle.size,
                    +transition.enabled,
                    transition.start.x, transition.start.y, transition.start.z,
                    transition.end.x, transition.end.y, transition.end.z,
                    transition.startTime,
                    transition.endTime,
                    transition.easing
                ];
            }).flat());
    }

    // #region Particles live update
    private _updateEventAttachedParticles: IParticle[] = [];
    private _attachParticleUpdateEventHandler = (index: number, particle: IParticle) => {
        particle.on(ParticleEventType.UPDATE, this._onParticleUpdate(index));
        this._updateEventAttachedParticles.push(particle);
    }

    private _onParticleUpdate = (particleIndex: number) => (particle: IParticle) => {
        const startIndex = particleIndex * this._strideLength;
        const [x, y, z] = particle.coords.components;
        const [r, g, b, a] = particle.color.components;
        const transition = particle.getTransitionSpecification();
        if (transition.enabled && !transition.committed)
            throw new Error('Particle transition have not been commited.');
        this._vertices[startIndex] = x;
        this._vertices[startIndex+1] = y;
        this._vertices[startIndex+2] = z;
        this._vertices[startIndex+3] = r;
        this._vertices[startIndex+4] = g;
        this._vertices[startIndex+5] = b;
        this._vertices[startIndex+6] = a;
        this._vertices[startIndex+7] = particle.size;
        this._vertices[startIndex+8] = +transition.enabled;
        this._vertices[startIndex+9] = transition.start.x;
        this._vertices[startIndex+10] = transition.start.y;
        this._vertices[startIndex+11] = transition.start.z;
        this._vertices[startIndex+12] = transition.end.x;
        this._vertices[startIndex+13] = transition.end.y;
        this._vertices[startIndex+14] = transition.end.z;
        this._vertices[startIndex+15] = transition.startTime;
        this._vertices[startIndex+16] = transition.endTime;
        this._vertices[startIndex+17] = transition.easing;
    }

    private _emptyEventAttachedParticles() {
        this._updateEventAttachedParticles.forEach(particle =>
            particle.off(ParticleEventType.UPDATE));
        this._updateEventAttachedParticles = [];
    }
    // #endregion

    update(deltaT: number, T: number): void {
        this._willUpdateParams[UpdateableParticlesProgramParam.CAMERA] = true;

        this._gl.useProgram(this._programContainer.program);
        this._gl.uniform1f(this._programContainer.uni(Uni.T), T);

        if (this._willUpdateParams[UpdateableParticlesProgramParam.RESOLUTION]) {
            this._gl.uniform3fv(this._programContainer.uni(Uni.RESOLUTION), new Float32Array(this.getResolutionVector()));
            this._willUpdateParams[UpdateableParticlesProgramParam.RESOLUTION] = false;
        }

        if (this._willUpdateParams[UpdateableParticlesProgramParam.CAMERA]) {
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.VIEW), false, this._viewBox.vMat);
            this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.PROJECTION), false, this._viewBox.pMat);
            this._gl.uniform3fv(this._programContainer.uni(Uni.EYE), new Float32Array(this._viewBox.eye.components));
            this._gl.uniform1f(this._programContainer.uni(Uni.DEPTH_OF_FIELD), +this._libraryInterface.params.camera.depthOfField);
            this._willUpdateParams[UpdateableParticlesProgramParam.CAMERA] = false;
        }
    }

    draw() {
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.SIZE));
        
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_ENABLED));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_START));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_END));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_START_TIME));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_END_TIME));
        this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_EASING_FUNCTION));

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

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_ENABLED),
            1,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            8 * Float32Array.BYTES_PER_ELEMENT
        );

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_START),
            3,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            9 * Float32Array.BYTES_PER_ELEMENT,
        );

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_END),
            3,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            12 * Float32Array.BYTES_PER_ELEMENT,
        );

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_START_TIME),
            1,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            15 * Float32Array.BYTES_PER_ELEMENT
        );

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_END_TIME),
            1,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            16 * Float32Array.BYTES_PER_ELEMENT
        );

        this._gl.vertexAttribPointer(
            this._programContainer.attr(Attr.POSITION_TRANSITION_EASING_FUNCTION),
            1,
            this._gl.FLOAT,
            false,
            this._strideLength * Float32Array.BYTES_PER_ELEMENT,
            17 * Float32Array.BYTES_PER_ELEMENT
        );
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.drawArrays(this._gl.POINTS, 0, this._vertices.length / this._strideLength);

        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.SIZE));
        
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_ENABLED));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_START));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_END));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_START_TIME));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_END_TIME));
        this._gl.disableVertexAttribArray(this._programContainer.attr(Attr.POSITION_TRANSITION_EASING_FUNCTION));
    }
}