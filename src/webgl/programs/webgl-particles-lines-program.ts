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
import { BaseProgram } from "./base-webgl-program";

enum Attr {
    POSITION       = 'v_position',
    COLOR          = 'v_color',
    POSITION_OTHER = 'v_positionOther',
}

enum Uni {
	MAX_DISTANCE = 'f_maxDistance',
}

export class ParticlesLinesProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _vertices: Float32Array = new Float32Array([]);
    private _mapper: ICommittedAttributeMapper<IParticleLinkPoint> | null = null;
    private _lines: IParticleLinkPoint[] = [];
    private _links: ParticleLinkPoint[] = [];
    private _maxParticleDistance = 300;

    constructor(
        gl: WebGLRenderingContext,
        viewBox: ViewBox,
        libraryInterface: IWebGLLibraryInterface,
    ) {
        super(
            gl,
            linesVertexShader,
            linesFragmentShader,
            Object.values(Attr),
            Object.values(Uni),
            viewBox,
            libraryInterface
        );
    }

    init() {
        this._mapper = AttributeMapper.build<IParticleLinkPoint>()
            .bringYourOwnVertices()
            .addMap(this.attr(Attr.POSITION), 3, this._gl.FLOAT, p => p.position)
            .addMap(this.attr(Attr.COLOR), 4, this._gl.FLOAT, p => p.color)
            .addMap(this.attr(Attr.POSITION_OTHER), 3, this._gl.FLOAT, p => p.positionNeighbour)
            .commit();

        this._vectorsBuffer = this._gl.createBuffer();
    }

    useParticles(particles: IParticle[], linksConfiguration: SystemLinksConfiguration) {

        const { width, height, depth } = this._libraryInterface.configuration;

        this._maxParticleDistance = getPxFromUnit(
            linksConfiguration.distance,
            linksConfiguration.unit,
            width,
            height,
            depth,
            this._libraryInterface.configuration.pixelRatio
        );

        const vertices: number[] = [];
        
        for (const particle of particles) {
            const neighbours = this._libraryInterface.getNeighbours(particle, this._maxParticleDistance);
            for (const neighbour of neighbours) {

                vertices.push(
                    particle.coords.x, particle.coords.y, particle.coords.z,
                    particle.color.x, particle.color.y, particle.color.z, particle.color.w,
                    neighbour.coords.x, neighbour.coords.y, neighbour.coords.z,

                    neighbour.coords.x, neighbour.coords.y, neighbour.coords.z,
                    neighbour.color.x, neighbour.color.y, neighbour.color.z, neighbour.color.w,
                    particle.coords.x, particle.coords.y, particle.coords.z,
                );
            }
        }

        this._vertices = new Float32Array(vertices);
    }

    draw(deltaT: number, T: number) {
        super.draw(deltaT, T);
        this._gl.uniform1f(this.uni(Uni.MAX_DISTANCE), this._maxParticleDistance);

        if (this._vertices.length) {
            this._mapper.enableAttributes(this._gl);
    
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);
    
            this._mapper.useVerticesAttibPointers(this._gl);
            
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    
            this._gl.drawArrays(this._gl.LINES, 0, this._vertices.length / this._mapper.getTotalSize());
    
            this._mapper.disableAttributes(this._gl);
        }

    }
}