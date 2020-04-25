vec3 vecToAbs(vec3 vec, vec3 v_res) {
    return ((vec / v_res) * 2.0) - 1.0;
}

#pragma glslify: export(vecToAbs)