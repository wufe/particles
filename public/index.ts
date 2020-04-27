import { init } from '../src/main';
import { RendererWebGLBuilder } from '../src/rendering/renderer-webgl';
import { DefaultParticleSystemBuilder } from '../src/systems/default-particle-system';
import { QuadTreeProximityDetectionSystem, QuadTreeFeatureBuilder } from '@wufe/particles-quadtree';
import { LinksFeatureBuilder } from '../src/webgl/features/links/links-feature';
import { Unit } from '../src/utils/units';
import { IProximityDetectionSystemBuilder } from '../src/models/proximity-detection/proximity-detection-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGLBuilder.build(),
    systems: [DefaultParticleSystemBuilder.build({
        color: [13, 41, 57, 1],
        count: { value: 600 },
        size: { randomize: true, boundary: { min: 15, max: 25 } },
        proximity: { value: 13, unit: Unit.VMIN }
    })],
    features: [
        // QuadTreeFeatureBuilder.build({ color: [255, 255, 255, .12] }),
        // DirectionsFeatureBuilder.build(),
        LinksFeatureBuilder.build(),
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
    proximityDetectionSystem: QuadTreeProximityDetectionSystem as any as IProximityDetectionSystemBuilder,
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})