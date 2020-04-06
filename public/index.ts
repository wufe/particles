import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { LiquidParticleSystemBuilder } from '../src/systems/liquid-particle-system';
import { TransitionParticleSystemBuilder } from '../src/systems/transition-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [TransitionParticleSystemBuilder.build()],
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