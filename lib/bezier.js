'use strict';

module.exports = function (x1, y1, x2, y2, epsilon) {
    var curveX = function curveX(t) {
        var v = 1 - t;
        return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
    };
    var curveY = function curveY(t) {
        var v = 1 - t;
        return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
    };
    var derivativeCurveX = function derivativeCurveX(t) {
        var v = 1 - t;
        return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2;
    };
    return function (t) {
        var x = t,
            t0,
            t1,
            t2,
            x2,
            d2,
            i;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = curveX(t2) - x;
            if (Math.abs(x2) < epsilon) return curveY(t2);
            d2 = derivativeCurveX(t2);
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        t0 = 0, t1 = 1, t2 = x;
        if (t2 < t0) return curveY(t0);
        if (t2 > t1) return curveY(t1);
        while (t0 < t1) {
            x2 = curveX(t2);
            if (Math.abs(x2 - x) < epsilon) return curveY(t2);
            if (x > x2) t0 = t2;else t1 = t2;
            t2 = (t1 - t0) * .5 + t0;
        }
        return curveY(t2);
    };
};