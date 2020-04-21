import { ViewBox } from "../camera/view-box";
import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";

export enum BaseUniforms {
    RESOLUTION     = 'v_res',
	WORLD          = 'm_world',
	VIEW           = 'm_view',
	PROJECTION     = 'm_projection',
	EYE            = 'v_eye',
	T              = 'f_t',
}

export enum BaseUniformAggregationType {
    CAMERA     = 'camera',
    RESOLUTION = 'resolution',
}

export class BaseProgram<TAttribs extends string = string, TUniforms extends string = string> {

    private _uniformsToUpdate: {[k in (BaseUniformAggregationType | TUniforms)]?: boolean} = {
        camera    : false,
        resolution: false,
    };

	constructor(
		private _gl: WebGLRenderingContext,
		private _vertexShaderText: string,
		private _fragmentShaderText: string,
		private _attributes: TAttribs[],
        private _uniforms: TUniforms[] = [],
        private _viewBox: ViewBox,
        private _libraryInterface: IWebGLLibraryInterface,
	) {
		this.compileShaders();
		this.createProgram();
		this.findLocations();
    }

    uniformChanged(uniform: BaseUniformAggregationType | TUniforms) {
        this._uniformsToUpdate[uniform] = true;
    }

    update(deltaT: number, T: number) {
        this._uniformsToUpdate[BaseUniformAggregationType.CAMERA] = true;

        this._gl.useProgram(this.program);
        this._gl.uniform1f(this.uni(BaseUniforms.T), T);

        if (this._uniformsToUpdate[BaseUniformAggregationType.RESOLUTION]) {
            this._gl.uniform3fv(this.uni(BaseUniforms.RESOLUTION), new Float32Array(this.getResolutionVector()));
            this._uniformsToUpdate[BaseUniformAggregationType.RESOLUTION] = false;
        }

        if (this._uniformsToUpdate[BaseUniformAggregationType.CAMERA]) {
            this._gl.uniformMatrix4fv(this.uni(BaseUniforms.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this.uni(BaseUniforms.VIEW), false, this._viewBox.vMat);
            this._gl.uniformMatrix4fv(this.uni(BaseUniforms.PROJECTION), false, this._viewBox.pMat);
            // TODO: Move into child class
            // this._gl.uniform3fv(this.uni(BaseUniforms.EYE), new Float32Array(this._viewBox.eye.components));
            // this._gl.uniform1f(this.uni(BaseUniforms.DEPTH_OF_FIELD), +this._libraryInterface.params.camera.depthOfField);
            this._uniformsToUpdate[BaseUniformAggregationType.CAMERA] = false;
        }
    }

    getResolutionVector() {
        return this._viewBox.getResolutionVector();
    }
    
    //#region Program container

	get program() {
		return this._program;
	}

	private _vertexShader: WebGLShader;
	private _fragmentShader: WebGLShader;

	private compileShaders() {
		this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
		this._gl.shaderSource(this._vertexShader, this._vertexShaderText);
		this._gl.compileShader(this._vertexShader);
		this.checkShaderCompilation(this._vertexShader, this._gl);

		this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
		this._gl.shaderSource(this._fragmentShader, this._fragmentShaderText);
		this._gl.compileShader(this._fragmentShader);
		this.checkShaderCompilation(this._fragmentShader, this._gl);
	}

	private _program: WebGLProgram;
	private createProgram() {
		this._program = this._gl.createProgram();
		this._gl.attachShader(this._program, this._vertexShader);
		this._gl.attachShader(this._program, this._fragmentShader);
		this._gl.linkProgram(this._program);
		this.checkProgramLink(this._program, this._gl);
		this._gl.validateProgram(this._program);
		this.checkProgramValidation(this._program, this._gl);
	}

	private _attributesLocations: Dictionary<number>;
	private _uniformsLocations  : Dictionary<WebGLUniformLocation>;
	private findLocations() {
		this._attributesLocations =
			this._attributes
				.reduce<Dictionary<number>>((acc, att) => {
					const attributeLocation = this._gl.getAttribLocation(this._program, att);
					if (attributeLocation === -1)
						console.warn(`Cannot find attribute ${att}.`)
					acc[att] = attributeLocation;
					return acc;
				}, {});
		this._uniformsLocations =
			this._uniforms
				.reduce<Dictionary<WebGLUniformLocation>>((acc, uni) => {
					const uniformLocation = this._gl.getUniformLocation(this._program, uni);
					if (uniformLocation === -1)
						console.warn(`Cannot find uniform ${uni}`);
					acc[uni] = uniformLocation;
					return acc;
				}, {});
	}

	getAttributeLocation = this.attr;
	attr(attrib: TAttribs) {
		return this._attributesLocations[attrib];
	}

	getUniformLocation = this.uni;
	uni(uniform: TUniforms | BaseUniforms) {
		return this._uniformsLocations[uniform];
	}
	
	checkShaderCompilation = (shader: WebGLShader, context: WebGLRenderingContext) => {
		if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
			throw new Error(`Error compiling shader: ${context.getShaderInfoLog(shader)}`);
		}
	}
	
	checkProgramLink = (program: WebGLProgram, context: WebGLRenderingContext) => {
		if (!context.getProgramParameter(program, context.LINK_STATUS)) {
			throw new Error(`Error linking program: ${context.getProgramInfoLog(program)}`);
		}
	}
	
	checkProgramValidation = (program: WebGLProgram, context: WebGLRenderingContext) => {
		if (!context.getProgramParameter(program, context.VALIDATE_STATUS)) {
			throw new Error(`Error linking program: ${context.getProgramInfoLog(program)}`);
		}
    }
    
    //#endregion
}

type Dictionary<T = any> = {
	[k: string]: T;
}