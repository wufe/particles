import { init } from '../src/main';
import { RendererWebGLBuilder } from '../src/rendering/renderer-webgl';
import { DefaultParticleSystemBuilder } from '../src/systems/default-particle-system';
import { QuadTreeProximityDetectionSystem } from '@wufe/particles-quadtree';
import { LinksFeatureBuilder } from '../src/webgl/features/links/links-feature';
import { Unit } from '../src/utils/units';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGLBuilder.build(),
    systems: [DefaultParticleSystemBuilder.build({
        color: [13, 41, 57, 1],
        count: { value: 500 },
        size: { randomize: true, boundary: { min: 20, max: 30 } }
    })],
    features: [
        // QuadTreeFeatureBuilder.build({ color: [255, 255, 255, .22] }) as TFeatureBuilder,
        // DirectionsFeatureBuilder.build(),
        LinksFeatureBuilder.build({ distance: { value: 13, unit: Unit.VMIN }}),
    ],
    camera: {
        enabled: true,
        zoom: {
            value: 7,
            locked: false
        },
        pitch: Math.PI / 4,
        yaw: (Math.PI / 6) * -1,
        depthOfField: true
    },
    fpsLimit: 30,
    proximityDetectionSystem: QuadTreeProximityDetectionSystem,
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})