vec3 vecToAbs(vec3 vec, vec3 v_res) {
    vec = ((vec / v_res) * 2.0) - 1.0;
    vec = vec3(
        clamp(vec.x, -1.0, 1.0),
        clamp(vec.y, -1.0, 1.0),
        clamp(vec.z, -1.0, 1.0)
    );
    return vec;
}

#pragma glslify: export(vecToAbs)