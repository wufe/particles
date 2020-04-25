#pragma glslify: vec3Easing = require(./easing.glsl)

vec3 getParticlePosition(
    vec3 v_pos,
    float t_enabled,
    vec3 t_start,
    vec3 t_end,
    float t_startTime,
    float t_endTime,
    float t_easingFunction,
    float f_t
) {
    vec3 pos;
    if (t_enabled == 1.0 && f_t >= t_startTime && f_t <= t_endTime) {

        float duration = t_endTime - t_startTime;
        float currentTime = f_t - t_startTime;
        vec3 startValue = t_start;
        vec3 changeValue = t_end - t_start;

        pos = vec3Easing(t_easingFunction, currentTime, startValue, changeValue, duration);
    } else {
        pos = v_pos;
    }
    return pos;
}

#pragma glslify: export(getParticlePosition)