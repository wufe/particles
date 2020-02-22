export const particlesVSText = `
precision highp float;

attribute vec3 v_pos;
attribute vec4 v_col;
attribute float f_size;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;

varying vec4 frag_col;

void main() {
    frag_col = v_col;
    vec3 pos = ((v_pos / v_res) * 2.0) - 1.0;
    gl_Position = m_projection * m_view * m_world * vec4(pos, 1.0);
    gl_PointSize = f_size > 0.0 ? f_size : 2.0;
}
`;