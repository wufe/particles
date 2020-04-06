#define EASING_FN_LINEAR 1.0
#define EASING_FN_QUADRATIC_IN 2.0
#define EASING_FN_QUADRATIC_OUT 3.0
#define EASING_FN_QUADRATIC_IN_OUT 4.0

vec3 vec3Linear(float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    return changeValue * currentTime / duration + startValue;
}

vec3 vec3QuadraticIn(float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    float time = currentTime / duration;
    return changeValue * time * time + startValue;
}

vec3 vec3QuadraticOut(float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    float time = currentTime / duration;
    return (changeValue * -1.0) * time * (time -2.0) + startValue;
}

vec3 vec3QuadraticInOut(float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    float time = currentTime / (duration / 2.0);
    if (time < 1.0) {
        return changeValue / 2.0 * time * time + startValue;
    }
    time = time - 1.0;
    return ((changeValue * -1.0) / 2.0) * (time * (time - 2.0) - 1.0) + startValue;
}

vec3 vec3Easing(float easingFn, float currentTime, vec3 startValue, vec3 changeValue, float duration) {
    vec3 pos;
    if (easingFn == EASING_FN_LINEAR) {
        pos = vec3Linear(currentTime, startValue, changeValue, duration);
    } else if (easingFn == EASING_FN_QUADRATIC_IN) {
        pos = vec3QuadraticIn(currentTime, startValue, changeValue, duration);
    } else if (easingFn == EASING_FN_QUADRATIC_OUT) {
        pos = vec3QuadraticOut(currentTime, startValue, changeValue, duration);
    } else if (easingFn == EASING_FN_QUADRATIC_IN_OUT) {
        pos = vec3QuadraticInOut(currentTime, startValue, changeValue, duration);
    }
    return pos;
}

#pragma glslify: export(vec3Easing)