import { IProgram } from "../../programs/webgl-program";
import { ProgramContainer } from "../../programs/webgl-program-container";
import { IViewBox } from "../../camera/view-box";
import { IParticle, Particle } from "../../../models/particle";
import linesVertexShader from "./shaders/links.vert";
import linesFragmentShader from "./shaders/links.frag";
import { Vector3D } from "../../../models/vector3d";
import { Vector4D } from "../../../models/vector4d";
import { getColor, IWebGLLibraryInterface } from "../../../rendering/renderer-webgl";
import { ParticleEventType } from "../../../models/base-particle";
import { AttributeMapper, ICommittedAttributeMapper } from "../../programs/webgl-attribute-mapper";
import { ParticleLinkPoint, ParticleLineEventType, IParticleLinkPoint } from "../../../models/particle-link-point";
import { performanceMetricsHelper } from "../../../utils/performance-metrics";
import { TSystemLinksConfiguration, ParticleSystemRequiredFeature } from "../../../models/particle-system";
import { getPxFromUnit, Unit } from "../../../utils/units";
import { BaseProgram } from "../../programs/base-webgl-program";
import { TLinksFeatureParams } from "./links-feature";

enum Attr {
    POSITION       = 'v_position',
    COLOR          = 'v_color',
    POSITION_OTHER = 'v_positionOther',
    MAX_DISTANCE       = 'f_maxDistance',
}

enum Uni {
	MAX_DISTANCE = 'f_maxDistance',
}

export class LinksProgram extends BaseProgram<Attr, Uni> implements IProgram {
    private _vectorsBuffer: WebGLBuffer;
    private _vertices: Float32Array = new Float32Array([]);
    private _mapper: ICommittedAttributeMapper<IParticleLinkPoint> | null = null;

    constructor(
        gl: WebGLRenderingContext,
        viewBox: IViewBox,
        libraryInterface: IWebGLLibraryInterface,
        private _params: TLinksFeatureParams
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
        super.init();

        this._mapper = AttributeMapper.build<IParticleLinkPoint>()
            .bringYourOwnVertices()
            .addMap(this.attr(Attr.POSITION), 3, this._gl.FLOAT, p => p.position)
            .addMap(this.attr(Attr.COLOR), 4, this._gl.FLOAT, p => p.color)
            .addMap(this.attr(Attr.POSITION_OTHER), 3, this._gl.FLOAT, p => p.positionNeighbour)
            .addMap(this.attr(Attr.MAX_DISTANCE), 1, this._gl.FLOAT, p => p.maxDistance)
            .commit();

        this._vectorsBuffer = this._gl.createBuffer();
    }

    _useParticles(particles: IParticle[]) {

        const vertices: number[] = [];
        
        const start = performance.now();
        for (const particle of particles) {
            const neighbours = particle.getNeighbours();
            for (const neighbour of neighbours) {

                vertices.push(
                    particle.coords.x, particle.coords.y, particle.coords.z,
                    particle.color.x, particle.color.y, particle.color.z, particle.color.w,
                    neighbour.coords.x, neighbour.coords.y, neighbour.coords.z,
                    particle.proximity,

                    neighbour.coords.x, neighbour.coords.y, neighbour.coords.z,
                    neighbour.color.x, neighbour.color.y, neighbour.color.z, neighbour.color.w,
                    particle.coords.x, particle.coords.y, particle.coords.z,
                    particle.proximity,
                );
            }
        }
        const end = performance.now();

        performanceMetricsHelper.set('link neighbours', Math.round(end-start));

        this._vertices = new Float32Array(vertices);
    }

    update(deltaT: number, T: number) {
        super.update(deltaT, T);

        const linkableParticles = this._libraryInterface.getParticlesBySystemFeature(ParticleSystemRequiredFeature.LINKS);

        if (linkableParticles.length) {

            this._useParticles(linkableParticles);
        }
    }

    draw(deltaT: number, T: number) {
        super.draw(deltaT, T);

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