import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { LiquidParticleSystemBuilder } from '../src/systems/liquid-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [LiquidParticleSystemBuilder.build()],
    camera: {
        enabled: true
    },
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    }
})