precision highp float;

#define BOUNDARY_MARGIN_PERCENTAGE 10.0

#pragma glslify: vec3Easing = require(../utils/easing.glsl)
#pragma glslify: alphaByPosition = require(../utils/boundary-transparency.glsl)

attribute vec3 v_pos;
attribute vec4 v_col;
attribute float f_size;

attribute float t_position_enabled;
attribute vec3 t_position_start;
attribute vec3 t_position_end;
attribute float t_position_start_time;
attribute float t_position_end_time;
attribute float t_position_easing_function;

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
    
    vec3 pos;
    if (t_position_enabled == 1.0 && f_t >= t_position_start_time && f_t <= t_position_end_time) {

        float duration = t_position_end_time - t_position_start_time;
        float currentTime = f_t - t_position_start_time;
        vec3 startValue = t_position_start;
        vec3 changeValue = t_position_end - t_position_start;

        pos = vec3Easing(t_position_easing_function, currentTime, startValue, changeValue, duration);
    } else {
        pos = v_pos;
    }
    frag_col = vec4(v_col.xyz, v_col.w * alphaByPosition(pos, v_res, BOUNDARY_MARGIN_PERCENTAGE));
    pos = vecToAbs(pos);
    gl_Position = m_projection * m_view * m_world * vec4(pos, 1.0);
    gl_PointSize = f_size > 0.0 ? f_size : 2.0;
}