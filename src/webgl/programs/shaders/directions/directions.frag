precision mediump float;

varying vec4 frag_col;

void main() {
    gl_FragColor = vec4(frag_col.xyz * frag_col.w, frag_col.w);
}