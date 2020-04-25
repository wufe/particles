#pragma glslify: alphaByPosition = require(./boundary-transparency.glsl)
#pragma glslify: vecToAbs = require(./positioning.glsl)

vec4 getParticleColor(vec4 v_col, vec3 v_pos, vec3 v_res, float f_boundaryMarginPercentage) {
    vec4 col = vec4(v_col.xyz, v_col.w * alphaByPosition(v_pos, v_res, f_boundaryMarginPercentage));
    return col;
}

#pragma glslify: export(getParticleColor)

