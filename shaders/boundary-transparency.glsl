float calculateDistanceFromLowerMargin(float f_coord, float f_boundary, float f_margin, float f_maxDistanceFromMargin) {
    if (f_coord < f_margin)
        f_maxDistanceFromMargin = max(f_maxDistanceFromMargin, (f_margin - f_coord) / f_boundary * 100.0);
    return f_maxDistanceFromMargin;
}

float calculateDistanceFromUpperMargin(float f_coord, float f_boundary, float f_margin, float f_maxDistanceFromMargin) {
    if (f_coord > f_boundary - f_margin)
        f_maxDistanceFromMargin = max(f_maxDistanceFromMargin, (f_coord - (f_boundary - f_margin)) / f_boundary * 100.0);
    return f_maxDistanceFromMargin;
}

// Accepts denormalized v_pos
float alphaByPosition(vec3 v_pos, vec3 v_res, float f_boundaryMarginPercentage) {

    float f_width = v_res.x;
    float f_height = v_res.y;
    float f_depth = v_res.z;

    float f_x = min(v_pos.x, f_width);
    float f_y = min(v_pos.y, f_height);
    float f_z = min(v_pos.z, f_depth);

    float f_maxDistanceFromMargin = 0.0;
    float f_widthMargin = f_width / 100.0 * f_boundaryMarginPercentage;
    float f_heightMargin = f_height / 100.0 * f_boundaryMarginPercentage;
    float f_depthMargin = f_depth / 100.0 * f_boundaryMarginPercentage;

    f_maxDistanceFromMargin = calculateDistanceFromLowerMargin(f_x, f_width, f_widthMargin, f_maxDistanceFromMargin);
    f_maxDistanceFromMargin = calculateDistanceFromUpperMargin(f_x, f_width, f_widthMargin, f_maxDistanceFromMargin);
    f_maxDistanceFromMargin = calculateDistanceFromLowerMargin(f_y, f_height, f_heightMargin, f_maxDistanceFromMargin);
    f_maxDistanceFromMargin = calculateDistanceFromUpperMargin(f_y, f_height, f_heightMargin, f_maxDistanceFromMargin);
    f_maxDistanceFromMargin = calculateDistanceFromLowerMargin(f_z, f_depth, f_depthMargin, f_maxDistanceFromMargin);
    f_maxDistanceFromMargin = calculateDistanceFromUpperMargin(f_z, f_depth, f_depthMargin, f_maxDistanceFromMargin);

    float f_alpha = 1.0;

    if (f_maxDistanceFromMargin > 0.0) {
        f_alpha = 1.0 - floor((f_maxDistanceFromMargin / f_boundaryMarginPercentage) * 100.0) / 100.0;
    }

    return f_alpha;
}

#pragma glslify: export(alphaByPosition)