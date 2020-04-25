precision highp float;

#define BOUNDARY_MARGIN_PERCENTAGE 10.0

#pragma glslify: getParticlePosition = require(../../../../../shaders/particle-position.glsl)
#pragma glslify: getParticleColor = require(../../../../../shaders/particle-color.glsl)
#pragma glslify: getParticleBlur = require(../../../../../shaders/particle-blur.glsl)
#pragma glslify: vecToAbs = require(../../../../../shaders/positioning.glsl)

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
uniform float f_zoom;
uniform vec3 v_eye;
uniform float f_dof;

varying vec4 frag_col;
varying float f_blur;
varying float f_dist;

void main() {

    vec3 pos = getParticlePosition(
        v_pos,
        t_position_enabled,
        t_position_start,
        t_position_end,
        t_position_start_time,
        t_position_end_time,
        t_position_easing_function,
        f_t
    );
    
    frag_col = getParticleColor(v_col, pos, v_res, BOUNDARY_MARGIN_PERCENTAGE);
    float size = f_size > 0.0 ? f_size: 2.0;

    if (f_dof == 1.0) {
        f_blur = getParticleBlur(v_pos, v_res, v_eye);
        size = size * (f_blur / 2.0 + 1.0);
    }

    float minPointScale = 1.1;
    float maxPointScale = 2.0;
    float maxZoom = 14.0;

    float pointScale = (1.0 - ((f_zoom - 1.0) / (maxZoom - 1.0))) + 1.0;
    pointScale = max(pointScale, minPointScale);
    pointScale = min(pointScale, maxPointScale);
    pointScale = pointScale / 2.0;
    gl_PointSize = pow(pointScale, 4.0) * size;

    
    pos = vecToAbs(pos, v_res);
    gl_Position = m_projection * m_world * m_view * vec4(pos, 1.0);
}