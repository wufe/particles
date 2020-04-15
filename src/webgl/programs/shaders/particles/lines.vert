precision highp float;

attribute float f_test;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;

varying vec4 frag_col;

vec3 vecToAbs(vec3 vec) {
    return ((vec / v_res) * 2.0) - 1.0;
}

void main() {
    
    frag_col = vec4(1.0, 1.0, 1.0, 1.0);
    vec3 pos = vec3(0.0, 0.0, 0.0);
    gl_Position = m_projection * m_view * m_world * vec4(pos, 1.0);
}