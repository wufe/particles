import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';
import { IParticleSystemBuilder } from '../src/models/particle-system';
import { LiquidParticleSystemBuilder, LiquidParticleSystem } from '@wufe/liquid-particle-system';
import { DefaultParticleSystem } from '../src/systems/default-particle-system';

init({
    selectorOrCanvas: '#canvas',
    renderer: RendererWebGL,
    systems: [/*LiquidParticleSystemBuilder.build() as any*/DefaultParticleSystem],
    camera: {
        enabled: true,
        zoom: {
            value: 2,
            locked: false
        }
    },
    events: {
        resize: {
            enabled: true,
            debounce: -1
        }
    },
})