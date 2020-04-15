#pragma glslify: alphaByPosition = require(../utils/boundary-transparency.glsl)

vec4 getParticleColor(vec4 v_col, vec3 v_pos, vec3 v_res, float f_boundaryMarginPercentage) {
    return vec4(v_col.xyz, v_col.w * alphaByPosition(v_pos, v_res, f_boundaryMarginPercentage));
}

#pragma glslify: export(getParticleColor)