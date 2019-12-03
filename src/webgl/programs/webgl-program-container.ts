export class ProgramContainer<TAttribs extends string = string, TUniforms extends string = string> {
	constructor(
		private _gl: WebGLRenderingContext,
		private _vertexShaderText: string,
		private _fragmentShaderText: string,
		private _attributes: TAttribs[],
		private _uniforms: TUniforms[] = [],
	) {

		this.compileShaders();
		this.createProgram();
		this.findLocations();

	}

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
	uni(uniform: TUniforms) {
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
}

type Dictionary<T = any> = {
	[k: string]: T;
}