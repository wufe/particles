export const particlesFSText =  `
precision mediump float;

varying vec4 frag_col;

void main() {
    float r = 0.0, delta = 0.0, alpha = frag_col.w;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    gl_FragColor = vec4(frag_col.xyz * alpha, alpha);
}
`;