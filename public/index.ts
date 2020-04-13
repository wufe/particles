import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { IParticleSystemBuilder } from '../src/models/particle-system';
import { LiquidParticleSystemBuilder } from '@wufe/liquid-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [LiquidParticleSystemBuilder.build({
        particles: {
            background: {
                count: 20
            },
            environment: {
                count: 500
            }
        }
    }) as any as IParticleSystemBuilder],
    camera: {
        enabled: true,
        zoom: {
            value: 1,
            locked: true
        }
    },
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})