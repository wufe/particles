import { init } from '../src/main';
import { RendererWebGL } from '../src/rendering/renderer-webgl';

init({
    selectorOrCanvas: '#canvas',
    renderer: new RendererWebGL()
})