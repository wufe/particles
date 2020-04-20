precision highp float;

uniform float f_dof;

varying vec4 frag_col;
varying float f_blur;

void main() {
    float r = 0.0, delta = 0.0, alpha = frag_col.w;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    vec3 v_color = frag_col.xyz;
    float max = 1.0;
    if (f_dof == 1.0) {
        max = max * f_blur;
        if (f_blur > 0.2) {
            v_color = v_color * (1.0 - (f_blur));
        }
    }
    
    if (r < max) {
        if (f_dof == 1.0) {
            float blur = 1.0 - f_blur;
            alpha = alpha * (1.0 - r * f_blur);
        }
    } else {
        discard;
    }
    gl_FragColor = vec4(v_color * alpha, alpha);
}