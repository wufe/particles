precision highp float;

#define BOUNDARY_MARGIN_PERCENTAGE 10.0

#pragma glslify: vecToAbs = require(../utils/positioning.glsl)
#pragma glslify: getParticleColor = require(../shared/particle-color.glsl)

attribute vec3 v_position;
attribute vec4 v_color;
attribute vec3 v_positionOther;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;
uniform float f_maxDistance;

varying vec4 frag_col;

void main() {
    float f_distance = distance(v_position, v_positionOther);
    float distanceCoefficient = clamp(1.0 - (f_distance / f_maxDistance), .05, 1.0);
    float alpha = min(getParticleColor(v_color, v_position, v_res, BOUNDARY_MARGIN_PERCENTAGE).w, distanceCoefficient);
    frag_col = vec4(v_color.xyz * alpha, alpha);
    vec3 pos = vecToAbs(v_position, v_res);
    gl_Position = m_projection * m_view * m_world * vec4(pos, 1.0);
}