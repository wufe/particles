export const particlesVSText = `
precision highp float;

attribute vec3 v_pos;
attribute vec4 v_col;
attribute float f_size;
attribute float b_useTransitions;
attribute vec3 v_startPos;
attribute vec3 v_targetPos;
attribute float f_startTime;
attribute float f_targetTime;
attribute float f_easing;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;

varying vec4 frag_col;

vec3 linear(float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    return changeValue * currentTime / duration + startValue;
}

vec3 vecToAbs(vec3 vec) {
    return ((vec / v_res) * 2.0) - 1.0;
}

void main() {
    frag_col = v_col;
    vec3 pos;
    if (b_useTransitions == 1.0 && f_t >= f_startTime && f_t <= f_targetTime) {

        float duration = f_targetTime - f_startTime;
        float currentTime = f_t - f_startTime;
        vec3 startValue = v_startPos;
        vec3 changeValue = v_targetPos - v_startPos;

        if (f_easing == 1.0) {
            pos = linear(currentTime, startValue, changeValue, duration);
        }
    } else {
        pos = v_pos;
    }
    pos = vecToAbs(pos);
    gl_Position = m_projection * m_view * m_world * vec4(pos, 1.0);
    gl_PointSize = f_size > 0.0 ? f_size : 2.0;
}
`;