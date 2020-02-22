import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { LiquidParticleSystemBuilder } from '../src/systems/liquid-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [LiquidParticleSystemBuilder.build({particles:{background:{count:80}}})],
    camera: {
        enabled: true
    }
})