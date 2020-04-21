import { IProgram } from "./webgl-program";
import { ProgramContainer } from "./webgl-program-container";
import { ViewBox } from "../camera/view-box";
import { IParticle, Particle } from "../../models/particle";
import linesVertexShader from "./shaders/particles/lines.vert";
import linesFragmentShader from "./shaders/particles/lines.frag";
import { Vector3D } from "../../models/vector3d";
import { Vector4D } from "../../models/vector4d";
import { getColor, IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { ParticleEventType } from "../../models/base-particle";
import { AttributeMapper, ICommittedAttributeMapper } from "./webgl-attribute-mapper";
import { ParticleLinkPoint, ParticleLineEventType, IParticleLinkPoint } from "../../models/particle-link-point";
import { performanceMetricsHelper } from "../../utils/performance-metrics";
import { SystemLinksConfiguration } from "../../models/particle-system";
import { getPxFromUnit } from "../../utils/units";

enum Attr {
    POSITION = 'v_position',
    COLOR    = 'v_color',
    DISTANCE = 'f_distance',
}

enum Uni {
	RESOLUTION   = 'v_res',
	WORLD        = 'm_world',
	VIEW         = 'm_view',
	PROJECTION   = 'm_projection',
	T            = 'f_t',
	MAX_DISTANCE = 'f_maxDistance',
}

export enum UpdateableParticlesProgramParam {
    CAMERA = 'cam',
    RESOLUTION = 'res',
}

export class ParticlesLinesProgram implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _programContainer: ProgramContainer;
    private _willUpdateParams: {[k in UpdateableParticlesProgramParam]?: boolean} = {
        cam   : true,
        res   : true,
    };
    private _vertices: Float32Array = new Float32Array([]);
    private _mapper: ICommittedAttributeMapper<IParticleLinkPoint> | null = null;
    private _lines: IParticleLinkPoint[] = [];
    private _links: ParticleLinkPoint[] = [];
    private _maxParticleDistance = 300;
    // private _strideLength = 18;

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

    init() {

        this._programContainer = new ProgramContainer<Attr, Uni>(
            this._gl,
            linesVertexShader,
            linesFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
        );

        this._mapper = AttributeMapper.build<IParticleLinkPoint>()
            .bringYourOwnVertices()
            .addMap(this._programContainer.attr(Attr.POSITION), 3, this._gl.FLOAT, p => p.position)
            .addMap(this._programContainer.attr(Attr.COLOR), 4, this._gl.FLOAT, p => p.color)
            .addMap(this._programContainer.attr(Attr.DISTANCE), 1, this._gl.FLOAT, p => p.distance)
            .commit();

        this._vectorsBuffer = this._gl.createBuffer();
    }

    useLinks(linkPoints: IParticleLinkPoint[]) {
        this._vertices = new Float32Array(linkPoints.map(linkPoint => [
            linkPoint.position.x, linkPoint.position.y, linkPoint.position.z,
            linkPoint.color.x, linkPoint.color.y, linkPoint.color.z, linkPoint.color.w,
            linkPoint.distance
        ]).flat());
    }

    useParticles(particles: IParticle[], linksConfiguration: SystemLinksConfiguration) {

        const { width, height, depth } = this._libraryInterface.configuration;

        this._maxParticleDistance = getPxFromUnit(
            linksConfiguration.distance,
            linksConfiguration.unit,
            width,
            height,
            depth
        );
        
        const linkPoints: ParticleLinkPoint[] = [];
        for (const particle of particles) {
            const neighbours = this._libraryInterface.getNeighbours(particle, this._maxParticleDistance);
            for (const neighbour of neighbours) {

                const distance = Math.hypot(
                    neighbour.coords.x - particle.coords.x,
                    neighbour.coords.y - particle.coords.y,
                    neighbour.coords.z - particle.coords.z
                );

                linkPoints.push(new ParticleLinkPoint(particle.coords, particle.color, distance));
                linkPoints.push(new ParticleLinkPoint(neighbour.coords, neighbour.color, distance));
            }
        }

        this.useLinks(linkPoints);
    }

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
            this._willUpdateParams[UpdateableParticlesProgramParam.CAMERA] = false;
        }

        this._gl.uniform1f(this._programContainer.uni(Uni.MAX_DISTANCE), this._maxParticleDistance);
    }

    draw() {

        if (this._vertices.length) {
            this._mapper.enableAttributes(this._gl);

            this._gl.useProgram(this._programContainer.program);
    
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);
    
            this._mapper.useVerticesAttibPointers(this._gl);
            
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    
            this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._mapper.getTotalSize());
    
            this._mapper.disableAttributes(this._gl);
        }

    }
}