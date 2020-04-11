import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { LiquidParticleSystemBuilder } from '../src/systems/liquid-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [LiquidParticleSystemBuilder.build({
        particles: {
            background: {
                count: 50
            },
            environment: {
                count: 500
            }
        }
    })],
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