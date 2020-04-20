import { init, Feature } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { IParticleSystemBuilder } from '../src/models/particle-system';
import { LiquidParticleSystemBuilder, LiquidParticleSystem } from '@wufe/liquid-particle-system';
import { DefaultParticleSystem } from '../src/systems/default-particle-system';
import { QuadTreeProximityDetectionSystem } from '../src/models/proximity-detection/quad-tree/quad-tree-proximity-detection-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [/*LiquidParticleSystemBuilder.build() as any*/DefaultParticleSystem],
    features: [
        Feature.LINKS,
        // Feature.QUAD_TREE
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
    },
})