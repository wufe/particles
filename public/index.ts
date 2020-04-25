import { init, Feature } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { TParticleSystemBuilder } from '../src/models/particle-system';
import { LiquidParticleSystemBuilder, LiquidParticleSystem } from '@wufe/liquid-particle-system';
import { DefaultParticleSystem, DefaultParticleSystemBuilder } from '../src/systems/default-particle-system';
import { QuadTreeFeatureBuilder, QuadTreeProximityDetectionSystem } from '@wufe/particles-quadtree';
import { DirectionsFeatureBuilder } from '../src/webgl/features/directions/directions-feature';
import { LinksFeatureBuilder } from '../src/webgl/features/links/links-feature';
import { TFeatureBuilder } from '../src/webgl/features/feature';
import { IProximityDetectionSystemBuilder } from '../src/models/proximity-detection/proximity-detection-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [/*LiquidParticleSystemBuilder.build() as any*/DefaultParticleSystemBuilder.build({
        color: [13, 41, 57, 1],
        count: { value: 500 },
        size: { value: 30 }
    })],
    features: [
        // QuadTreeFeatureBuilder.build({ color: [255, 255, 255, .22] }) as any as TFeatureBuilder,
        // DirectionsFeatureBuilder.build(),
        // LinksFeatureBuilder.build(),
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