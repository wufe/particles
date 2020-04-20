#pragma glslify: vecToAbs = require(../utils/positioning.glsl)

float getParticleBlur(vec3 v_pos, vec3 v_res, vec3 v_eye) {
    vec3 v_normalizedPos = vecToAbs(v_pos, v_res);
    vec3 v_normalizedEye = v_eye;

    float distance = distance(v_normalizedPos, v_normalizedEye);
    float depth = distance / 1.97;
    return depth * .8;
}

#pragma glslify: export(getParticleBlur)