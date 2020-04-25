import { init, Feature } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { IParticleSystemBuilder } from '../src/models/particle-system';
import { LiquidParticleSystemBuilder, LiquidParticleSystem } from '@wufe/liquid-particle-system';
import { DefaultParticleSystem } from '../src/systems/default-particle-system';
import { QuadTreeProximityDetectionSystem } from '../src/models/proximity-detection/quad-tree/quad-tree-proximity-detection-system';
import { QuadTreeFeatureBuilder } from '../src/webgl/features/quadtree/quadtree-feature';
import { DirectionsFeatureBuilder } from '../src/webgl/features/directions/directions-feature';
import { LinksFeatureBuilder } from '../src/webgl/features/links/links-feature';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [/*LiquidParticleSystemBuilder.build() as any*/DefaultParticleSystem],
    features: [
        QuadTreeFeatureBuilder.build({ color: [255, 255, 255, .22] }),
        DirectionsFeatureBuilder.build(),
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
    proximityDetectionSystem: QuadTreeProximityDetectionSystem,
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})