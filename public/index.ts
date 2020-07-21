import { init } from '../src/main';
import { RendererWebGLBuilder } from '../src/rendering/renderer-webgl';
import { DefaultParticleSystemBuilder } from '../src/systems/default-particle-system';
import { QuadTreeProximityDetectionSystemBuilder, QuadTreeFeatureBuilder } from '@wufe/particles-quadtree';
import { LinksFeatureBuilder } from '../src/webgl/features/links/links-feature';
import { Unit } from '../src/utils/units';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGLBuilder.build(),
    systems: [DefaultParticleSystemBuilder.build({
        color: [150, 255, 150, 1],
        count: { value: 300 },
        size: { randomize: true, boundary: { min: 5, max: 15 } },
        proximity: { value: 17, unit: Unit.VMIN }
    })],
    features: [
        // QuadTreeFeatureBuilder.build({ color: [255, 255, 255, .12] }),
        // DirectionsFeatureBuilder.build(),
        LinksFeatureBuilder.build(),
    ],
    camera: {
        enabled: true,
        zoom: {
            value: 4,
            locked: false
        },
        pitch: Math.PI / 4,
        yaw: (Math.PI / 6) * -1,
        depthOfField: true
    },
    fpsLimit: 30,
    proximityDetection: {
        system: QuadTreeProximityDetectionSystemBuilder.build(),
    },
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})