precision highp float;

#pragma glslify: vecToAbs = require(../utils/positioning.glsl)

attribute vec3 v_pos;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;

varying vec4 frag_col;

vec3 getPosition(vec3 pos, vec3 res) {
    pos = vecToAbs(v_pos, v_res);
    return pos;
}

void main() {
    frag_col = vec4(1.0, 0.9, 0.41, .21);
    gl_Position = m_projection * m_view * m_world * vec4(getPosition(v_pos, v_res), 1.0);
}