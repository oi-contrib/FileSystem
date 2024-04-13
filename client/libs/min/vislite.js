/*!
* VISLite JavaScript Library v1.0.0-next.5
* git+https://github.com/oi-contrib/VISLite.git
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VISLite = factory());
})(this, (function () { 'use strict';

    var Hermite = (function () {
        function Hermite(u) {
            if (u === void 0) { u = 0.5; }
            this.name = 'Hermite';
            this.__u = u;
        }
        Hermite.prototype.setP = function (x1, y1, x2, y2, s1, s2) {
            if (x1 < x2) {
                this.__a = x1;
                this.__b = x2;
                var p3 = this.__u * s1, p4 = this.__u * s2;
                y1 /= (x2 - x1);
                y2 /= (x2 - x1);
                this.__MR = [
                    2 * y1 - 2 * y2 + p3 + p4,
                    3 * y2 - 3 * y1 - 2 * p3 - p4,
                    p3,
                    y1
                ];
            }
            else
                throw new Error('The point x-position should be increamented!');
            return this;
        };
        Hermite.prototype.use = function (x) {
            if (this.__MR) {
                var sx = (x - this.__a) / (this.__b - this.__a), sx2 = sx * sx, sx3 = sx * sx2;
                var sResult = sx3 * this.__MR[0] + sx2 * this.__MR[1] + sx * this.__MR[2] + this.__MR[3];
                return sResult * (this.__b - this.__a);
            }
            else
                throw new Error('You shoud first set the position!');
        };
        return Hermite;
    }());

    var Cardinal = (function () {
        function Cardinal(t) {
            if (t === void 0) { t = 0; }
            this.name = 'Cardinal';
            this.__t = t;
        }
        Cardinal.prototype.setP = function (points) {
            this.__HS = {
                "x": [],
                "h": []
            };
            var flag, slope = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]), temp;
            this.__HS.x[0] = points[0][0];
            for (flag = 1; flag < points.length; flag++) {
                if (points[flag][0] <= points[flag - 1][0])
                    throw new Error('The point position should be increamented!');
                this.__HS.x[flag] = points[flag][0];
                if (flag < points.length - 1) {
                    if ((points[flag + 1][1] > points[flag][1] && points[flag - 1][1] > points[flag][1]) ||
                        (points[flag + 1][1] < points[flag][1] && points[flag - 1][1] < points[flag][1]) ||
                        points[flag + 1][1] == points[flag][1] ||
                        points[flag - 1][1] == points[flag][1]) {
                        temp = 0;
                    }
                    else {
                        temp = (points[flag + 1][1] - points[flag - 1][1]) / (points[flag + 1][0] - points[flag - 1][0]);
                    }
                }
                else {
                    temp = (points[flag][1] - points[flag - 1][1]) / (points[flag][0] - points[flag - 1][0]);
                }
                this.__HS.h[flag - 1] = new Hermite((1 - this.__t) * 0.5).setP(points[flag - 1][0], points[flag - 1][1], points[flag][0], points[flag][1], slope, temp);
                slope = temp;
            }
            return this;
        };
        Cardinal.prototype.use = function (x) {
            if (this.__HS) {
                this.__i = -1;
                while (this.__i + 1 < this.__HS.x.length && (x > this.__HS.x[this.__i + 1] || (this.__i == -1 && x >= this.__HS.x[this.__i + 1]))) {
                    this.__i += 1;
                }
                if (this.__i < 0) {
                    return this.__HS.h[0].use(this.__HS.x[0]);
                }
                else if (this.__i >= this.__HS.h.length) {
                    return this.__HS.h[this.__HS.h.length - 1].use(this.__HS.x[this.__HS.x.length - 1]);
                }
                return this.__HS.h[this.__i].use(x);
            }
            else {
                throw new Error('You shoud first set the position!');
            }
        };
        return Cardinal;
    }());

    function _move (d, a, b, c) {
        if (c === void 0) { c = 0; }
        var sqrt = Math.sqrt(a * a + b * b + c * c);
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            a * d / sqrt, b * d / sqrt, c * d / sqrt, 1
        ];
    }

    function _rotate (deg) {
        var sin = Math.sin(deg), cos = Math.cos(deg);
        return [
            cos, sin, 0, 0,
            -sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    function _scale (xTimes, yTimes, zTimes, cx, cy, cz) {
        if (cx === void 0) { cx = 0; }
        if (cy === void 0) { cy = 0; }
        if (cz === void 0) { cz = 0; }
        return [
            xTimes, 0, 0, 0,
            0, yTimes, 0, 0,
            0, 0, zTimes, 0,
            cx - cx * xTimes, cy - cy * yTimes, cz - cz * zTimes, 1
        ];
    }

    function _transform (a1, b1, c1, a2, b2, c2) {
        if (typeof a1 === 'number' && typeof b1 === 'number') {
            if (typeof c1 !== 'number') {
                c1 = 0;
                a2 = a1;
                b2 = b1;
                c2 = 1;
            }
            else if (typeof a2 !== 'number' || typeof b2 !== 'number' || typeof c2 !== 'number') {
                a2 = a1;
                b2 = b1;
                c2 = c1;
                a1 = 0;
                b1 = 0;
                c1 = 0;
            }
            if (a1 == a2 && b1 == b2 && c1 == c2)
                throw new Error('It\'s not a legitimate ray!');
            var sqrt1 = Math.sqrt((a2 - a1) * (a2 - a1) + (b2 - b1) * (b2 - b1)), cos1 = sqrt1 != 0 ? (b2 - b1) / sqrt1 : 1, sin1 = sqrt1 != 0 ? (a2 - a1) / sqrt1 : 0, b = (a2 - a1) * sin1 + (b2 - b1) * cos1, c = c2 - c1, sqrt2 = Math.sqrt(b * b + c * c), cos2 = sqrt2 != 0 ? c / sqrt2 : 1, sin2 = sqrt2 != 0 ? b / sqrt2 : 0;
            return [
                [
                    cos1, cos2 * sin1, sin1 * sin2, 0,
                    -sin1, cos1 * cos2, cos1 * sin2, 0,
                    0, -sin2, cos2, 0,
                    b1 * sin1 - a1 * cos1, c1 * sin2 - a1 * sin1 * cos2 - b1 * cos1 * cos2, -a1 * sin1 * sin2 - b1 * cos1 * sin2 - c1 * cos2, 1
                ],
                [
                    cos1, -sin1, 0, 0,
                    cos2 * sin1, cos2 * cos1, -sin2, 0,
                    sin1 * sin2, cos1 * sin2, cos2, 0,
                    a1, b1, c1, 1
                ]
            ];
        }
        else {
            throw new Error('a1 and b1 is required!');
        }
    }

    var _multiply = function (matrix4, param) {
        var newParam = [];
        for (var i = 0; i < 4; i++)
            for (var j = 0; j < param.length / 4; j++)
                newParam[j * 4 + i] =
                    matrix4[i] * param[j * 4] +
                        matrix4[i + 4] * param[j * 4 + 1] +
                        matrix4[i + 8] * param[j * 4 + 2] +
                        matrix4[i + 12] * param[j * 4 + 3];
        return newParam;
    };
    var __initMatrix4 = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    var Matrix4 = (function () {
        function Matrix4(initMatrix4) {
            if (initMatrix4 === void 0) { initMatrix4 = __initMatrix4; }
            this.name = 'Matrix4';
            this.__matrix4 = initMatrix4;
        }
        Matrix4.prototype.setValue = function (initMatrix4) {
            if (initMatrix4 === void 0) { initMatrix4 = __initMatrix4; }
            this.__matrix4 = initMatrix4;
            return this;
        };
        Matrix4.prototype.move = function (dis, a, b, c) {
            if (c === void 0) { c = 0; }
            this.__matrix4 = _multiply(_move(dis, a, b, c), this.__matrix4);
            return this;
        };
        Matrix4.prototype.rotate = function (deg, a1, b1, c1, a2, b2, c2) {
            var matrix4s = _transform(a1, b1, c1, a2, b2, c2);
            this.__matrix4 = _multiply(_multiply(_multiply(matrix4s[1], _rotate(deg)), matrix4s[0]), this.__matrix4);
            return this;
        };
        Matrix4.prototype.scale = function (xTimes, yTimes, zTimes, cx, cy, cz) {
            if (cx === void 0) { cx = 0; }
            if (cy === void 0) { cy = 0; }
            if (cz === void 0) { cz = 0; }
            this.__matrix4 = _multiply(_scale(xTimes, yTimes, zTimes, cx, cy, cz), this.__matrix4);
            return this;
        };
        Matrix4.prototype.multiply = function (newMatrix4, flag) {
            if (flag === void 0) { flag = false; }
            this.__matrix4 = flag ? _multiply(this.__matrix4, newMatrix4) : _multiply(newMatrix4, this.__matrix4);
            return this;
        };
        Matrix4.prototype.use = function (x, y, z, w) {
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 1; }
            return _multiply(this.__matrix4, [x, y, z, w]);
        };
        Matrix4.prototype.value = function () {
            return this.__matrix4;
        };
        return Matrix4;
    }());

    function rotate$1 (cx, cy, deg, x, y) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [
            (x - cx) * cos - (y - cy) * sin + cx,
            (x - cx) * sin + (y - cy) * cos + cy
        ];
    }

    function move (ax, ay, d, x, y) {
        var sqrt = Math.sqrt(ax * ax + ay * ay);
        return [
            ax * d / sqrt + x,
            ay * d / sqrt + y
        ];
    }

    function scale (cx, cy, times, x, y) {
        return [
            times * (x - cx) + cx,
            times * (y - cy) + cy
        ];
    }

    function getLoopColors (num, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var colorList = [
            'rgba(84,112,198,' + alpha + ")", 'rgba(145,204,117,' + alpha + ")",
            'rgba(250,200,88,' + alpha + ")", 'rgba(238,102,102,' + alpha + ")",
            'rgba(115,192,222,' + alpha + ")", 'rgba(59,162,114,' + alpha + ")",
            'rgba(252,132,82,' + alpha + ")", 'rgba(154,96,180,' + alpha + ")",
            'rgba(234,124,204,' + alpha + ")"
        ];
        var colors = [];
        if (num <= colorList.length) {
            return colorList;
        }
        else {
            if (num % colorList.length == 0) {
                for (var i = 0; i < (num / colorList.length); i++) {
                    colors = colors.concat(colorList);
                }
            }
            else {
                for (var j = 1; j < (num / colorList.length); j++) {
                    colors = colors.concat(colorList);
                }
                if (num % colorList.length == 1) {
                    colors = colors.concat(colorList[4]);
                }
                else {
                    for (var k = 0; k < num % colorList.length; k++) {
                        colors = colors.concat(colorList[k]);
                    }
                }
            }
        }
        return colors;
    }

    var $timers = [];
    var $interval = 13;
    var $timerId;
    function animation (doback, duration, callback) {
        if (duration === void 0) { duration = 400; }
        if (callback === void 0) { callback = function () { }; }
        var clock = {
            "timer": function (tick, duration, callback) {
                if (!tick) {
                    throw new Error('Tick is required!');
                }
                var id = new Date().valueOf() + "_" + (Math.random() * 1000).toFixed(0);
                $timers.push({
                    "id": id,
                    "createTime": new Date(),
                    "tick": tick,
                    "duration": duration,
                    "callback": callback
                });
                clock.start();
                return id;
            },
            "start": function () {
                if (!$timerId) {
                    $timerId = setInterval(clock.tick, $interval);
                }
            },
            "tick": function () {
                var createTime, flag, tick, callback, timer, duration, passTime;
                var timers = $timers;
                $timers = [];
                $timers.length = 0;
                for (flag = 0; flag < timers.length; flag++) {
                    timer = timers[flag];
                    createTime = timer.createTime;
                    tick = timer.tick;
                    duration = timer.duration;
                    callback = timer.callback;
                    passTime = (+new Date().valueOf() - createTime.valueOf()) / duration;
                    passTime = passTime > 1 ? 1 : passTime;
                    tick(passTime);
                    if (passTime < 1 && timer.id) {
                        $timers.push(timer);
                    }
                    else {
                        callback(passTime);
                    }
                }
                if ($timers.length <= 0) {
                    clock.stop();
                }
            },
            "stop": function () {
                if ($timerId) {
                    clearInterval($timerId);
                    $timerId = null;
                }
            }
        };
        var id = clock.timer(function (deep) {
            doback(deep);
        }, duration, callback);
        return function () {
            var i;
            for (i in $timers) {
                if ($timers[i].id == id) {
                    $timers[i].id = void 0;
                    return;
                }
            }
        };
    }

    function ruler (maxValue, minValue, num, option) {
        if (maxValue < minValue) {
            var temp = minValue;
            minValue = maxValue;
            maxValue = temp;
        }
        else if (maxValue == minValue) {
            return [maxValue];
        }
        var times100 = (function (_value) {
            var _times100_base = (_value < 100 && _value > -100) ? 10 : 0.1;
            var _times100 = -1, _tiemsValue = _value;
            while (_times100_base == 10 ?
                (_tiemsValue >= -100 && _tiemsValue <= 100)
                :
                    (_tiemsValue <= -100 || _tiemsValue >= 100)) {
                _times100 += 1;
                _tiemsValue *= _times100_base;
            }
            if (_times100_base == 10) {
                return Math.pow(10, _times100);
            }
            else {
                var temp = "0.";
                for (var i = 1; i < _times100; i++) {
                    temp += "0";
                }
                return +(temp + "1");
            }
        })(maxValue - minValue);
        var distance100_oral = Math.ceil((maxValue - minValue) * times100 / num);
        var getResult = function (changValue) {
            var distance100 = {
                3: 2,
                4: 5,
                6: 5,
                7: 5,
                8: 10,
                9: 10,
                11: 10,
                12: 10,
                13: 15,
                14: 15,
                16: 15,
                17: 15,
                18: 20,
                19: 20,
                21: 20,
                22: 20,
                23: 25,
                24: 25,
                26: 25,
                27: 25
            }[distance100_oral + changValue] || (distance100_oral + changValue);
            var distance = distance100 / times100;
            var begin = Math.floor(minValue / distance) * distance;
            var rulerArray = [];
            rulerArray.push(begin);
            for (var index = 1; rulerArray[rulerArray.length - 1] < maxValue; index++) {
                rulerArray.push(begin + distance * index);
            }
            return rulerArray;
        };
        var rulerArray = getResult(0);
        var balanceMax = function () {
            var rulerArray_temp = [];
            var changeDist = rulerArray[rulerArray.length - 1] - (option === null || option === void 0 ? void 0 : option.max);
            for (var index = 0; index < rulerArray.length; index++) {
                if (index + 1 < rulerArray.length && rulerArray[index + 1] - changeDist < minValue) ;
                else {
                    rulerArray_temp.push(rulerArray[index] - changeDist);
                }
            }
            return rulerArray_temp;
        };
        var balanceMin = function () {
            var rulerArray_temp = [];
            var changeDist = rulerArray[0] - (option === null || option === void 0 ? void 0 : option.min);
            for (var index = 0; index < rulerArray.length; index++) {
                rulerArray_temp[index] = rulerArray[index] - changeDist;
                if (maxValue <= rulerArray_temp[index])
                    break;
            }
            return rulerArray_temp;
        };
        if (option) {
            if ('max' in option && 'min' in option && option.max >= maxValue && option.min <= minValue) {
                var isAnswer = function () {
                    if (rulerArray[0] >= option.min && rulerArray[rulerArray.length - 1] <= option.max)
                        return true;
                    var rulerArray_max = balanceMax();
                    if (rulerArray_max[0] >= option.min && rulerArray_max[rulerArray_max.length - 1] <= option.max) {
                        rulerArray = rulerArray_max;
                        return true;
                    }
                    var rulerArray_min = balanceMin();
                    if (rulerArray_min[0] >= option.min && rulerArray_min[rulerArray_max.length - 1] <= option.max) {
                        rulerArray = rulerArray_min;
                        return true;
                    }
                };
                if (isAnswer())
                    return rulerArray;
                for (var changValue = 1; changValue < 100; changValue++) {
                    rulerArray = getResult(changValue);
                    if (isAnswer())
                        return rulerArray;
                    rulerArray = getResult(-changValue);
                    if (isAnswer())
                        return rulerArray;
                }
            }
            if ('max' in option && option.max >= maxValue) {
                if (option.max < rulerArray[rulerArray.length - 1]) {
                    rulerArray = balanceMax();
                }
            }
            else if ('min' in option && option.min <= minValue) {
                if (option.min > rulerArray[0]) {
                    rulerArray = balanceMin();
                }
            }
        }
        for (var index = 0; index < rulerArray.length; index++) {
            var valStr = rulerArray[index] + "";
            if (/\./.test(valStr)) {
                if (/9{7,}$/.test(valStr)) {
                    valStr = valStr.replace(/9{7,}$/, '');
                    rulerArray[index] = +(valStr.substring(0, valStr.length - 1) + ((+valStr[valStr.length - 1]) + 1));
                }
                else if (/0{7,}\d$/.test(valStr)) {
                    rulerArray[index] = +(valStr.replace(/0{7,}\d$/, ''));
                }
            }
        }
        return rulerArray;
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var XLINK_ATTRIBUTE = ["href", "title", "show", "type", "role", "actuate"];

    function toNode(tagname) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagname);
    }
    var _setAttribute = function (el, key, value) {
        if (XLINK_ATTRIBUTE.indexOf(key) > -1) {
            el.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:' + key, value + "");
        }
        else {
            el.setAttribute(key, value + "");
        }
    };
    var setAttribute = _setAttribute;
    function getAttribute(el, key) {
        if (XLINK_ATTRIBUTE.indexOf(key) > -1)
            key = 'xlink:' + key;
        return el.getAttribute(key);
    }
    function full(el, config) {
        _setAttribute(el, "stroke", config.strokeStyle);
        _setAttribute(el, "fill", config.fillStyle);
        _setAttribute(el, "stroke-dasharray", config.lineDash.join(','));
    }
    function fill(el, config) {
        _setAttribute(el, "fill", config.fillStyle);
    }
    function stroke(el, config) {
        _setAttribute(el, "stroke", config.strokeStyle);
        _setAttribute(el, "fill", "none");
        _setAttribute(el, "stroke-dasharray", config.lineDash.join(','));
    }

    function setStyle (el, styles) {
        for (var key in styles) {
            el.style[key] = styles[key];
        }
    }

    var rotate = function (cx, cy, deg, x, y) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [
            +((x - cx) * cos - (y - cy) * sin + cx).toFixed(7),
            +((x - cx) * sin + (y - cy) * cos + cy).toFixed(7)
        ];
    };
    function arc (beginA, rotateA, cx, cy, r1, r2, doback) {
        if (rotateA < 0) {
            beginA += rotateA;
            rotateA *= -1;
        }
        var temp = [];
        var p;
        p = rotate(0, 0, beginA, r1, 0);
        temp[0] = p[0];
        temp[1] = p[1];
        p = rotate(0, 0, rotateA, p[0], p[1]);
        temp[2] = p[0];
        temp[3] = p[1];
        p = rotate(0, 0, beginA, r2, 0);
        temp[4] = p[0];
        temp[5] = p[1];
        p = rotate(0, 0, rotateA, p[0], p[1]);
        temp[6] = p[0];
        temp[7] = p[1];
        doback(beginA, beginA + rotateA, temp[0] + cx, temp[1] + cy, temp[4] + cx, temp[5] + cy, temp[2] + cx, temp[3] + cy, temp[6] + cx, temp[7] + cy, (r2 - r1) * 0.5);
    }

    var initDefs = function (el) {
        var defs = el.getElementsByTagName('defs');
        if (defs.length <= 0) {
            var newDefs = toNode("defs");
            el.appendChild(newDefs);
            return newDefs;
        }
        else {
            return defs[0];
        }
    };
    var initText$1 = function (el, config, x, y, deg) {
        if (el.nodeName.toLowerCase() !== "text")
            throw new Error("Need a <text> !");
        setAttribute(el, "dy", {
            top: config["fontSize"] * 0.5,
            middle: 0,
            bottom: -config["fontSize"] * 0.5,
        }[config.textBaseline]);
        setStyle(el, {
            "text-anchor": {
                left: "start",
                right: "end",
                center: "middle",
            }[config.textAlign],
            "dominant-baseline": "central",
            "font-size": config["fontSize"] + "px",
            "font-family": config["fontFamily"],
        });
        setAttribute(el, "x", x);
        setAttribute(el, "y", y);
        if (typeof deg == "number") {
            deg = deg % 360;
            setAttribute(el, "transform", "rotate(" + deg + "," + x + "," + y + ")");
        }
    };
    var initCircle$1 = function (el, cx, cy, r) {
        if (el.nodeName.toLowerCase() !== "circle")
            throw new Error("Need a <circle> !");
        setAttribute(el, "cx", cx);
        setAttribute(el, "cy", cy);
        setAttribute(el, "r", r);
    };
    var initPath = function (el, path) {
        if (el.nodeName.toLowerCase() !== "path")
            throw new Error("Need a <path> !");
        setAttribute(el, "d", path);
    };
    var initRect$1 = function (el, x, y, width, height) {
        if (el.nodeName.toLowerCase() !== "rect")
            throw new Error("Need a <rect> !");
        if (height < 0) {
            height *= -1;
            y -= height;
        }
        if (width < 0) {
            width *= -1;
            x -= width;
        }
        setAttribute(el, "x", x);
        setAttribute(el, "y", y);
        setAttribute(el, "width", width);
        setAttribute(el, "height", height);
    };
    var initArc$1 = function (el, config, cx, cy, r1, r2, beginDeg, deg) {
        if (el.nodeName.toLowerCase() !== "path")
            throw new Error("Need a <path> !");
        beginDeg = (beginDeg / 180) * Math.PI;
        deg = (deg / 180) * Math.PI;
        beginDeg = beginDeg % (Math.PI * 2);
        if (r1 > r2) {
            var temp = r1;
            r1 = r2;
            r2 = temp;
        }
        if (deg >= Math.PI * 1.999999 || deg <= -Math.PI * 1.999999) {
            deg = Math.PI * 1.999999;
        }
        else {
            deg = deg % (Math.PI * 2);
        }
        arc(beginDeg, deg, cx, cy, r1, r2, function (beginA, endA, begInnerX, begInnerY, begOuterX, begOuterY, endInnerX, endInnerY, endOuterX, endOuterY, r) {
            var f = endA - beginA > Math.PI ? 1 : 0;
            var d = "M" + begInnerX + " " + begInnerY;
            if (r < 0)
                r = -r;
            d +=
                "A" + r1 + " " + r1 + " 0 " + f + " 1 " + endInnerX + " " + endInnerY;
            if (config.arcEndCap == "round")
                d += "A" + r + " " + r + " " + " 0 1 0 " + endOuterX + " " + endOuterY;
            else if (config.arcEndCap == "-round")
                d += "A" + r + " " + r + " " + " 0 1 1 " + endOuterX + " " + endOuterY;
            else
                d += "L" + endOuterX + " " + endOuterY;
            d +=
                "A" + r2 + " " + r2 + " 0 " + f + " 0 " + begOuterX + " " + begOuterY;
            if (config.arcStartCap == "round")
                d += "A" + r + " " + r + " " + " 0 1 0 " + begInnerX + " " + begInnerY;
            else if (config.arcStartCap == "-round")
                d += "A" + r + " " + r + " " + " 0 1 1 " + begInnerX + " " + begInnerY;
            else
                d += "L" + begInnerX + " " + begInnerY;
            if (config.arcStartCap == "butt")
                d += "Z";
            setAttribute(el, "d", d);
        });
    };

    var enhanceGradient$1 = function (gradient, gradientId) {
        var enhanceGradient = {
            "value": function () {
                return "url(#" + gradientId + ")";
            },
            "setColor": function (stop, color) {
                var stopEl = toNode("stop");
                gradient.appendChild(stopEl);
                setAttribute(stopEl, "offset", (stop * 100) + "%");
                setAttribute(stopEl, "style", "stop-color:" + color + ";");
                return enhanceGradient;
            }
        };
        return enhanceGradient;
    };
    var linearGradient$1 = function (el, x0, y0, x1, y1) {
        var defs = initDefs(el);
        var gradientId = "vislite-lg-" + new Date().valueOf() + "-" + Math.random();
        var linearGradient = toNode("linearGradient");
        defs.appendChild(linearGradient);
        setAttribute(linearGradient, "id", gradientId);
        setAttribute(linearGradient, "x1", x0 + "%");
        setAttribute(linearGradient, "y1", y0 + "%");
        setAttribute(linearGradient, "x2", x1 + "%");
        setAttribute(linearGradient, "y2", y1 + "%");
        return enhanceGradient$1(linearGradient, gradientId);
    };
    var radialGradient$1 = function (el, cx, cy, r) {
        var defs = initDefs(el);
        var gradientId = "vislite-rg-" + new Date().valueOf() + "-" + Math.random();
        var radialGradient = toNode("radialGradient");
        defs.appendChild(radialGradient);
        setAttribute(radialGradient, "id", gradientId);
        setAttribute(radialGradient, "cx", cx + "%");
        setAttribute(radialGradient, "cy", cy + "%");
        setAttribute(radialGradient, "r", r + "%");
        return enhanceGradient$1(radialGradient, gradientId);
    };

    var SVG$1 = (function () {
        function SVG(svg) {
            this.name = "SVG";
            this.__config = {
                fillStyle: "#000",
                strokeStyle: "#000",
                lineWidth: 1,
                textAlign: "left",
                textBaseline: "middle",
                "fontSize": 16,
                "fontFamily": "sans-serif",
                "arcStartCap": "butt",
                "arcEndCap": "butt",
                lineDash: [],
            };
            this.__path = "";
            this.__currentPosition = [];
            this.__svg = svg;
        }
        SVG.prototype.config = function (params) {
            if (typeof params !== "object") {
                return this.__config[params];
            }
            else {
                for (var key in params) {
                    this.__config[key] = params[key];
                }
            }
            return this;
        };
        SVG.prototype.useEl = function (el) {
            this.__useEl = el;
            return this;
        };
        SVG.prototype.getEl = function () {
            return this.__useEl;
        };
        SVG.prototype.appendEl = function (el, context) {
            context = context || this.__svg;
            if (typeof el == "string")
                el = toNode(el);
            context.appendChild(el);
            this.__useEl = el;
            return this;
        };
        SVG.prototype.appendBoard = function (el, context) {
            var _el = el;
            if (typeof el == "string")
                _el =
                    {
                        text: "text",
                        path: "path",
                        arc: "path",
                        circle: "circle",
                        rect: "rect",
                    }[el] || "";
            if (_el == "")
                throw new Error("Unsupported drawing method:" + el);
            return this.appendEl(_el, context);
        };
        SVG.prototype.remove = function () {
            if (!this.__useEl) {
                throw new Error("Currently, no node can be deleted.");
            }
            else {
                this.__useEl.parentNode.removeChild(this.__useEl);
            }
            return this;
        };
        SVG.prototype.attr = function (params) {
            if (!this.__useEl)
                throw new Error("Currently, no node can be modified or viewed.");
            if (typeof params !== "object") {
                return getAttribute(this.__useEl, params);
            }
            else {
                for (var key in params) {
                    setAttribute(this.__useEl, key, params[key]);
                }
                return this;
            }
        };
        SVG.prototype.fillText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            initText$1(this.__useEl, this.__config, x, y, deg);
            this.__useEl.textContent = text;
            fill(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.strokeText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            initText$1(this.__useEl, this.__config, x, y, deg);
            this.__useEl.textContent = text;
            stroke(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fullText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            initText$1(this.__useEl, this.__config, x, y, deg);
            this.__useEl.textContent = text;
            full(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fillArc = function (cx, cy, r1, r2, beginDeg, deg) {
            initArc$1(this.__useEl, this.__config, cx, cy, r1, r2, beginDeg, deg);
            fill(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.strokeArc = function (cx, cy, r1, r2, beginDeg, deg) {
            initArc$1(this.__useEl, this.__config, cx, cy, r1, r2, beginDeg, deg);
            stroke(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fullArc = function (cx, cy, r1, r2, beginDeg, deg) {
            initArc$1(this.__useEl, this.__config, cx, cy, r1, r2, beginDeg, deg);
            full(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fillCircle = function (cx, cy, r) {
            initCircle$1(this.__useEl, cx, cy, r);
            fill(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.strokeCircle = function (cx, cy, r) {
            initCircle$1(this.__useEl, cx, cy, r);
            stroke(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fullCircle = function (cx, cy, r) {
            initCircle$1(this.__useEl, cx, cy, r);
            full(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fillRect = function (x, y, width, height) {
            initRect$1(this.__useEl, x, y, width, height);
            fill(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.strokeRect = function (x, y, width, height) {
            initRect$1(this.__useEl, x, y, width, height);
            stroke(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.fullRect = function (x, y, width, height) {
            initRect$1(this.__useEl, x, y, width, height);
            full(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.beginPath = function () {
            this.__currentPosition = [];
            this.__path = "";
            return this;
        };
        SVG.prototype.closePath = function () {
            this.__path += "Z";
            return this;
        };
        SVG.prototype.moveTo = function (x, y) {
            this.__currentPosition = [x, y];
            this.__path += "M" + x + " " + y;
            return this;
        };
        SVG.prototype.lineTo = function (x, y) {
            this.__currentPosition = [x, y];
            this.__path += (this.__path == "" ? "M" : "L") + x + " " + y;
            return this;
        };
        SVG.prototype.fill = function () {
            initPath(this.__useEl, this.__path);
            fill(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.stroke = function () {
            initPath(this.__useEl, this.__path);
            stroke(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.full = function () {
            initPath(this.__useEl, this.__path);
            full(this.__useEl, this.__config);
            return this;
        };
        SVG.prototype.arc = function (x, y, r, beginDeg, deg) {
            var begPosition = rotate$1(x, y, (beginDeg / 180) * Math.PI, x + r, y);
            var endPosition = rotate$1(x, y, ((beginDeg + deg) / 180) * Math.PI, x + r, y);
            if (this.__path == "") {
                this.__path += "M" + begPosition[0] + "," + begPosition[1];
            }
            else if (begPosition[0] != this.__currentPosition[0] ||
                begPosition[1] != this.__currentPosition[1]) {
                this.__path += "L" + begPosition[0] + "," + begPosition[1];
            }
            this.__path +=
                "A" +
                    r +
                    "," +
                    r +
                    " 0 " +
                    (deg > 180 || deg < -180 ? 1 : 0) +
                    "," +
                    (deg > 0 ? 1 : 0) +
                    " " +
                    endPosition[0] +
                    "," +
                    endPosition[1];
            return this;
        };
        SVG.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            this.__path += "Q" + cpx + " " + cpy + "," + x + " " + y;
            return this;
        };
        SVG.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.__path +=
                "C" + cp1x + " " + cp1y + "," + cp2x + " " + cp2y + "," + x + " " + y;
            return this;
        };
        SVG.prototype.bind = function (eventType, callback) {
            this.__useEl.addEventListener(eventType, function (event) {
                callback.call(this, event, this);
            }, false);
            return this;
        };
        SVG.prototype.createLinearGradient = function (x0, y0, x1, y1) {
            return linearGradient$1(this.__svg, x0, y0, x1, y1);
        };
        SVG.prototype.createRadialGradient = function (cx, cy, r) {
            return radialGradient$1(this.__svg, cx, cy, r);
        };
        return SVG;
    }());

    var SVG = (function (_super) {
        __extends(SVG, _super);
        function SVG(el) {
            if (!el) {
                throw new Error("VISLite SVG:The mount point requires an HTMLElement type but encountered null.");
            }
            var width = el.clientWidth, height = el.clientHeight;
            var ViewSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            el.appendChild(ViewSVG);
            ViewSVG.setAttribute("width", width + "");
            ViewSVG.setAttribute("height", height + "");
            ViewSVG.setAttribute("viewBox", "0 0 " + width + " " + height);
            return _super.call(this, ViewSVG) || this;
        }
        return SVG;
    }(SVG$1));

    var initText = function (painter, config, x, y, deg) {
        painter.beginPath();
        painter.translate(x, y);
        painter.rotate(deg);
        painter.font =
            config.fontStyle +
                " " +
                config.fontWeight +
                " " +
                config.fontSize +
                "px " +
                config.fontFamily;
        return painter;
    };
    var initArc = function (painter, config, cx, cy, r1, r2, beginDeg, deg) {
        if (r1 > r2) {
            var temp = r1;
            r1 = r2;
            r2 = temp;
        }
        beginDeg = beginDeg % (Math.PI * 2);
        if (deg >= Math.PI * 1.999999 || deg <= -Math.PI * 1.999999) {
            deg = Math.PI * 2;
        }
        else {
            deg = deg % (Math.PI * 2);
        }
        arc(beginDeg, deg, cx, cy, r1, r2, function (beginA, endA, begInnerX, begInnerY, begOuterX, begOuterY, endInnerX, endInnerY, endOuterX, endOuterY, r) {
            if (r < 0)
                r = -r;
            painter.beginPath();
            painter.moveTo(begInnerX, begInnerY);
            painter.arc(cx, cy, r1, beginA, endA, false);
            if (config.arcEndCap == "round")
                painter.arc((endInnerX + endOuterX) * 0.5, (endInnerY + endOuterY) * 0.5, r, endA - Math.PI, endA, true);
            else if (config.arcEndCap == "-round")
                painter.arc((endInnerX + endOuterX) * 0.5, (endInnerY + endOuterY) * 0.5, r, endA - Math.PI, endA, false);
            else
                painter.lineTo(endOuterX, endOuterY);
            painter.arc(cx, cy, r2, endA, beginA, true);
            if (config.arcStartCap == "round")
                painter.arc((begInnerX + begOuterX) * 0.5, (begInnerY + begOuterY) * 0.5, r, beginA, beginA - Math.PI, true);
            else if (config.arcStartCap == "-round")
                painter.arc((begInnerX + begOuterX) * 0.5, (begInnerY + begOuterY) * 0.5, r, beginA, beginA - Math.PI, false);
            else
                painter.lineTo(begInnerX, begInnerY);
        });
        if (config.arcStartCap == "butt")
            painter.closePath();
        return painter;
    };
    var initCircle = function (painter, cx, cy, r) {
        painter.beginPath();
        painter.moveTo(cx + r, cy);
        painter.arc(cx, cy, r, 0, Math.PI * 2);
        return painter;
    };
    var initRect = function (painter, x, y, width, height) {
        painter.beginPath();
        painter.rect(x, y, width, height);
        return painter;
    };

    function texts (painter, contents, width, height, doback) {
        var lineNumber = 0, content = "";
        for (var i = 0; i < contents.length; i++) {
            if (painter.measureText(content + contents[i]).width > width || /\n$/.test(content)) {
                lineNumber += 1;
                doback(content, (lineNumber - 0.5) * height);
                content = contents[i];
            }
            else if (i == contents.length - 1) {
                lineNumber += 1;
                doback(content + contents[i], (lineNumber - 0.5) * height);
            }
            else {
                content += contents[i];
            }
        }
        return lineNumber * height;
    }

    var Painter = (function () {
        function Painter(canvas, opts, region, isPainter, scaleSize) {
            if (opts === void 0) { opts = {}; }
            if (isPainter === void 0) { isPainter = false; }
            this.__region = null;
            this.__onlyRegion = false;
            this.__specialConfig = {
                "fontSize": 16,
                "fontFamily": "sans-serif",
                "fontWeight": 400,
                "fontStyle": "normal",
                "arcStartCap": 'butt',
                "arcEndCap": 'butt'
            };
            this.__initConfig = {
                "fillStyle": 'black',
                "strokeStyle": 'black',
                "lineWidth": 1,
                "textAlign": 'left',
                "textBaseline": 'middle',
                "lineDash": [],
                "shadowBlur": 0,
                "shadowColor": "black"
            };
            this.painter = canvas.getContext("2d", opts);
            this.__region = region;
            this.__isPainter = isPainter;
            this.painter.textBaseline = 'middle';
            this.painter.textAlign = 'left';
        }
        Painter.prototype.useConfig = function (key, value) {
            if (this.__region) {
                if (['fillStyle', 'strokeStyle', 'shadowBlur', 'shadowColor'].indexOf(key) < 0) {
                    this.__region.useConfig(key, value);
                }
            }
            if (this.__isPainter && this.__onlyRegion)
                return this;
            if (key == 'lineDash') {
                if (this.painter.setLineDash)
                    this.painter.setLineDash(value);
            }
            else if (key in this.__specialConfig) {
                if (key == 'fontSize') {
                    value = Math.round(value);
                }
                this.__specialConfig[key] = value;
            }
            else if (key in this.__initConfig) {
                this.painter[key] = value;
            }
            else {
                throw new Error('Illegal configuration item of painter : ' + key + " !");
            }
            return this;
        };
        Painter.prototype.fillText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            if (this.__region)
                this.__region.fillText(text, x, y, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg).fillText(text, 0, 0);
            this.painter.restore();
            return this;
        };
        Painter.prototype.strokeText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            if (this.__region)
                this.__region.strokeText(text, x, y, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg).strokeText(text, 0, 0);
            this.painter.restore();
            return this;
        };
        Painter.prototype.fullText = function (text, x, y, deg) {
            if (deg === void 0) { deg = 0; }
            if (this.__region)
                this.__region.fullText(text, x, y, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg);
            this.painter.fillText(text, 0, 0);
            this.painter.strokeText(text, 0, 0);
            this.painter.restore();
            return this;
        };
        Painter.prototype.fillTexts = function (contents, x, y, width, lineHeight, deg) {
            var _this = this;
            if (lineHeight === void 0) { lineHeight = 1.2; }
            if (deg === void 0) { deg = 0; }
            var h = 0;
            if (this.__region)
                h = this.__region.fillTexts(contents, x, y, width, lineHeight);
            if (this.__isPainter && this.__onlyRegion)
                return h;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg);
            var height = texts(this.painter, contents, width, this.__specialConfig.fontSize * lineHeight, function (content, top) {
                _this.painter.fillText(content, 0, top);
            });
            this.painter.restore();
            return height;
        };
        Painter.prototype.strokeTexts = function (contents, x, y, width, lineHeight, deg) {
            var _this = this;
            if (lineHeight === void 0) { lineHeight = 1.2; }
            if (deg === void 0) { deg = 0; }
            var h = 0;
            if (this.__region)
                h = this.__region.fillTexts(contents, x, y, width, lineHeight);
            if (this.__isPainter && this.__onlyRegion)
                return h;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg);
            var height = texts(this.painter, contents, width, this.__specialConfig.fontSize * lineHeight, function (content, top) {
                _this.painter.strokeText(content, 0, top);
            });
            this.painter.restore();
            return height;
        };
        Painter.prototype.fullTexts = function (contents, x, y, width, lineHeight, deg) {
            var _this = this;
            if (lineHeight === void 0) { lineHeight = 1.2; }
            if (deg === void 0) { deg = 0; }
            var h = 0;
            if (this.__region)
                h = this.__region.fillTexts(contents, x, y, width, lineHeight);
            if (this.__isPainter && this.__onlyRegion)
                return h;
            this.painter.save();
            initText(this.painter, this.__specialConfig, x, y, deg);
            var height = texts(this.painter, contents, width, this.__specialConfig.fontSize * lineHeight, function (content, top) {
                _this.painter.fillText(content, 0, top);
                _this.painter.strokeText(content, 0, top);
            });
            this.painter.restore();
            return height;
        };
        Painter.prototype.beginPath = function () {
            if (this.__region)
                this.__region.beginPath();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.beginPath();
            return this;
        };
        Painter.prototype.closePath = function () {
            if (this.__region)
                this.__region.closePath();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.closePath();
            return this;
        };
        Painter.prototype.moveTo = function (x, y) {
            if (this.__region)
                this.__region.moveTo(x, y);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
            return this;
        };
        Painter.prototype.lineTo = function (x, y) {
            if (this.__region)
                this.__region.lineTo(x, y);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
            return this;
        };
        Painter.prototype.arc = function (x, y, r, beginDeg, deg) {
            if (this.__region)
                this.__region.arc(x, y, r, beginDeg, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.arc(x, y, r, beginDeg, beginDeg + deg, deg < 0);
            return this;
        };
        Painter.prototype.fill = function () {
            if (this.__region)
                this.__region.fill();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.fill();
            return this;
        };
        Painter.prototype.stroke = function () {
            if (this.__region)
                this.__region.stroke();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.stroke();
            return this;
        };
        Painter.prototype.full = function () {
            if (this.__region)
                this.__region.full();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.fill();
            this.painter.stroke();
            return this;
        };
        Painter.prototype.save = function () {
            if (this.__region)
                this.__region.save();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.save();
            return this;
        };
        Painter.prototype.restore = function () {
            if (this.__region)
                this.__region.restore();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.restore();
            return this;
        };
        Painter.prototype.clip = function () {
            if (this.__region)
                this.__region.clip();
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.clip();
            return this;
        };
        Painter.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            if (this.__region)
                this.__region.quadraticCurveTo(cpx, cpy, x, y);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.quadraticCurveTo(cpx, cpy, x, y);
            return this;
        };
        Painter.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            if (this.__region)
                this.__region.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            return this;
        };
        Painter.prototype.clearRect = function (x, y, w, h) {
            if (this.__region)
                this.__region.clearRect(x, y, w, h);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            this.painter.clearRect(x, y, w, h);
            return this;
        };
        Painter.prototype.fillArc = function (cx, cy, r1, r2, beginDeg, deg) {
            if (this.__region)
                this.__region.fillArc(cx, cy, r1, r2, beginDeg, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initArc(this.painter, this.__specialConfig, cx, cy, r1, r2, beginDeg, deg).fill();
            return this;
        };
        Painter.prototype.strokeArc = function (cx, cy, r1, r2, beginDeg, deg) {
            if (this.__region)
                this.__region.strokeArc(cx, cy, r1, r2, beginDeg, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initArc(this.painter, this.__specialConfig, cx, cy, r1, r2, beginDeg, deg).stroke();
            return this;
        };
        Painter.prototype.fullArc = function (cx, cy, r1, r2, beginDeg, deg) {
            if (this.__region)
                this.__region.fullArc(cx, cy, r1, r2, beginDeg, deg);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initArc(this.painter, this.__specialConfig, cx, cy, r1, r2, beginDeg, deg);
            this.painter.fill();
            this.painter.stroke();
            return this;
        };
        Painter.prototype.fillCircle = function (cx, cy, r) {
            if (this.__region)
                this.__region.fillCircle(cx, cy, r);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initCircle(this.painter, cx, cy, r).fill();
            return this;
        };
        Painter.prototype.strokeCircle = function (cx, cy, r) {
            if (this.__region)
                this.__region.strokeCircle(cx, cy, r);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initCircle(this.painter, cx, cy, r).stroke();
            return this;
        };
        Painter.prototype.fullCircle = function (cx, cy, r) {
            if (this.__region)
                this.__region.fullCircle(cx, cy, r);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initCircle(this.painter, cx, cy, r);
            this.painter.fill();
            this.painter.stroke();
            return this;
        };
        Painter.prototype.fillRect = function (x, y, width, height) {
            if (this.__region)
                this.__region.fillRect(x, y, width, height);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initRect(this.painter, x, y, width, height).fill();
            return this;
        };
        Painter.prototype.strokeRect = function (x, y, width, height) {
            if (this.__region)
                this.__region.strokeRect(x, y, width, height);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initRect(this.painter, x, y, width, height).stroke();
            return this;
        };
        Painter.prototype.fullRect = function (x, y, width, height) {
            if (this.__region)
                this.__region.fullRect(x, y, width, height);
            if (this.__isPainter && this.__onlyRegion)
                return this;
            initRect(this.painter, x, y, width, height);
            this.painter.fill();
            this.painter.stroke();
            return this;
        };
        Painter.prototype.draw = function () {
            return Promise.resolve();
        };
        Painter.prototype.drawImage = function (img, x, y, w, h, isImage) {
            var _this = this;
            if (isImage === void 0) { isImage = false; }
            return new Promise(function (resolve) {
                if (_this.__region) {
                    _this.__region.fillRect(x, y, w, h);
                }
                if (_this.__isPainter && _this.__onlyRegion) {
                    resolve({});
                    return;
                }
                if (typeof img == 'string' && !isImage) {
                    var imgInstance_1 = new Image();
                    imgInstance_1.onload = function () {
                        _this.painter.drawImage(imgInstance_1, 0, 0, imgInstance_1.width, imgInstance_1.height, x, y, w, h);
                        resolve({});
                    };
                    imgInstance_1.src = img;
                }
                else {
                    _this.painter.drawImage(img, 0, 0, w, h, x, y, w, h);
                    resolve({});
                }
            });
        };
        return Painter;
    }());

    function assemble (begin, end, step, count) {
        var val = [];
        for (var index = 0; index < count; index++)
            val[index] = begin;
        return function () {
            for (var i = 0; i < count; i++) {
                if (val[i] + step < end) {
                    val[i] = +(val[i] + step).toFixed(7);
                    break;
                }
                else if (i < count - 1) {
                    val[i] = begin;
                }
            }
            return val;
        };
    }

    var enhanceGradient = function (gradient) {
        var enhanceGradient = {
            "value": function () {
                return gradient;
            },
            "setColor": function (stop, color) {
                gradient.addColorStop(stop, color);
                return enhanceGradient;
            }
        };
        return enhanceGradient;
    };
    var linearGradient = function (painter, x0, y0, x1, y1) {
        var gradient = painter.createLinearGradient(x0, y0, x1, y1);
        return enhanceGradient(gradient);
    };
    var radialGradient = function (painter, cx, cy, r) {
        var gradient = painter.createRadialGradient(cx, cy, 0, cx, cy, r);
        return enhanceGradient(gradient);
    };

    var Canvas$1 = (function (_super) {
        __extends(Canvas, _super);
        function Canvas(ViewCanvas, RegionCanvas, opts, scaleSize) {
            if (opts === void 0) { opts = {}; }
            if (scaleSize === void 0) { scaleSize = 1; }
            var _this = _super.call(this, ViewCanvas, opts, RegionCanvas ? new Painter(RegionCanvas, {
                willReadFrequently: true,
            }) : undefined, true, scaleSize) || this;
            _this.name = "Canvas";
            _this.__regionList = {};
            _this.__regionAssemble = assemble(0, 255, 10, 3);
            _this.__scaleSize = scaleSize;
            _this.setRegion("");
            return _this;
        }
        Canvas.prototype.config = function (configs) {
            for (var key in configs) {
                this.useConfig(key, configs[key]);
            }
            return this;
        };
        Canvas.prototype.onlyRegion = function (flag) {
            this.__onlyRegion = flag;
            return this;
        };
        Canvas.prototype.setRegion = function (regionName) {
            if (this.__region) {
                if (regionName) {
                    if (this.__regionList[regionName] == void 0) {
                        var tempColor = this.__regionAssemble();
                        this.__regionList[regionName] =
                            "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
                    }
                    this.__region.useConfig("fillStyle", this.__regionList[regionName]) &&
                        this.__region.useConfig("strokeStyle", this.__regionList[regionName]);
                }
                else {
                    this.__region.useConfig("fillStyle", "#000000") &&
                        this.__region.useConfig("strokeStyle", "#000000");
                }
            }
            return this;
        };
        Canvas.prototype.getRegion = function (x, y) {
            var _this = this;
            return new Promise(function (resolve) {
                var imgData = _this.__region ? _this.__region.painter.getImageData(x - 0.5, y - 0.5, 1, 1) : {
                    data: [0, 0, 0, 0]
                };
                var currentRGBA = imgData.data;
                var doit = function () {
                    if (_this.__region) {
                        for (var key in _this.__regionList) {
                            if ("rgb(" +
                                currentRGBA[0] +
                                "," +
                                currentRGBA[1] +
                                "," +
                                currentRGBA[2] +
                                ")" ==
                                _this.__regionList[key]) {
                                resolve(key);
                                break;
                            }
                        }
                    }
                    resolve("");
                };
                if (currentRGBA) {
                    doit();
                }
                else {
                    imgData.then(function (data) {
                        currentRGBA = data;
                        doit();
                    });
                }
            });
        };
        Canvas.prototype.textWidth = function (text) {
            this.painter.save();
            initText(this.painter, this.__specialConfig, 0, 0, 0);
            var width = this.painter.measureText(text + "").width;
            this.painter.restore();
            return width;
        };
        Canvas.prototype.getContext = function (isRegion) {
            if (isRegion === void 0) { isRegion = false; }
            return isRegion ? (this.__region ? this.__region.painter : null) : this.painter;
        };
        Canvas.prototype.getInfo = function () {
            return {
                width: this.painter.canvas.width / this.__scaleSize,
                height: this.painter.canvas.height / this.__scaleSize
            };
        };
        Canvas.prototype.createLinearGradient = function (x0, y0, x1, y1) {
            return linearGradient(this.painter, x0, y0, x1, y1);
        };
        Canvas.prototype.createRadialGradient = function (cx, cy, r) {
            return radialGradient(this.painter, cx, cy, r);
        };
        Canvas.prototype.getColor = function (x, y) {
            x *= this.__scaleSize;
            y *= this.__scaleSize;
            var currentRGBA = this.painter.getImageData(x - 0.5, y - 0.5, 1, 1).data;
            return ("rgba(" +
                currentRGBA[0] +
                "," +
                currentRGBA[1] +
                "," +
                currentRGBA[2] +
                "," +
                currentRGBA[3] +
                ")");
        };
        return Canvas;
    }(Painter));

    function mergeOption (option, defaultOption) {
        for (var key in option) {
            defaultOption[key] = option[key];
        }
        return defaultOption;
    }

    var Canvas = (function (_super) {
        __extends(Canvas, _super);
        function Canvas(el, option, width, height) {
            if (option === void 0) { option = {}; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            var _this = this;
            if (!el) {
                throw new Error("VISLite Canvas:The mount point requires an HTMLElement type but encountered null.");
            }
            option = mergeOption(option, {
                region: true,
                willReadFrequently: false
            });
            width = width || el.clientWidth;
            height = height || el.clientHeight;
            var ViewCanvas, RegionCanvas = null;
            var _el = el;
            if (_el._vislite_canvas_) {
                ViewCanvas = _el._vislite_canvas_[0];
                RegionCanvas = _el._vislite_canvas_[1];
            }
            else {
                ViewCanvas = document.createElement('canvas');
                el.appendChild(ViewCanvas);
                if (option.region) {
                    RegionCanvas = document.createElement('canvas');
                }
                _el._vislite_canvas_ = [ViewCanvas, RegionCanvas];
                el.setAttribute('vislite', 'Canvas');
            }
            var canvasArray = [RegionCanvas, ViewCanvas];
            for (var index = 0; index < canvasArray.length; index++) {
                var canvas = canvasArray[index];
                if (canvas) {
                    canvas.style.width = width + "px";
                    canvas.setAttribute('width', (index * width + width) + "");
                    canvas.style.height = height + "px";
                    canvas.setAttribute('height', (index * height + height) + "");
                }
            }
            _this = _super.call(this, ViewCanvas, RegionCanvas, {
                willReadFrequently: option.willReadFrequently,
            }, 2) || this;
            _this.__canvas = ViewCanvas;
            _this.painter.scale(2, 2);
            return _this;
        }
        Canvas.prototype.toDataURL = function () {
            var _this = this;
            return new Promise(function (resolve) {
                resolve(_this.__canvas.toDataURL());
            });
        };
        return Canvas;
    }(Canvas$1));

    function getWebGLContext$1 (canvas, scale, opts, mode) {
        if (opts === void 0) { opts = {}; }
        if (mode === void 0) { mode = "scaleToFill"; }
        var names = ["experimental-webgl", "webkit-3d", "moz-webgl"];
        var painter = canvas.getContext("webgl", opts);
        for (var i = 0; i < names.length; i++) {
            try {
                painter = canvas.getContext(names[i], opts);
            }
            catch (e) { }
            if (painter)
                break;
        }
        if (!painter)
            throw new Error('Non canvas or browser does not support webgl.');
        var width = painter.canvas.width, height = painter.canvas.height;
        var scaleX = scale, scaleY = scale;
        if (mode == "aspectFit") {
            if (width > height) {
                scaleX *= height / width;
            }
            else if (height > width) {
                scaleY *= width / height;
            }
        }
        else if (mode == "aspectFill") {
            if (width > height) {
                scaleY *= width / height;
            }
            else if (height > width) {
                scaleX *= height / width;
            }
        }
        var viewWidth = width * scaleX;
        var viewHeight = height * scaleY;
        painter.viewport((width - viewWidth) * 0.5, (height - viewHeight) * 0.5, viewWidth, viewHeight);
        painter.depthFunc(painter.LEQUAL);
        painter.enable(painter.DEPTH_TEST);
        return painter;
    }

    var getWebGLContext = (function (el, scale, mode) {
        if (scale === void 0) { scale = 1; }
        if (!el) {
            throw new Error("VISLite getWebGLContext:The mount point requires an HTMLElement type but encountered null.");
        }
        var width = el.clientWidth, height = el.clientHeight;
        var ViewCanvas;
        var _el = el;
        if (_el._vislite_canvas_) {
            ViewCanvas = _el._vislite_canvas_;
        }
        else {
            ViewCanvas = document.createElement('canvas');
            el.appendChild(ViewCanvas);
            _el._vislite_canvas_ = ViewCanvas;
            el.setAttribute('vislite', 'WebGL');
        }
        ViewCanvas.style.width = width + "px";
        ViewCanvas.setAttribute('width', width + "");
        ViewCanvas.style.height = height + "px";
        ViewCanvas.setAttribute('height', height + "");
        return getWebGLContext$1(ViewCanvas, scale, {}, mode);
    });

    var loadShader = function (painter, type, source) {
        var shader = painter.createShader(type);
        if (shader == null)
            throw new Error('Unable to create shader!');
        painter.shaderSource(shader, source);
        painter.compileShader(shader);
        if (!painter.getShaderParameter(shader, painter.COMPILE_STATUS))
            throw new Error('Failed to compile shader:' + painter.getShaderInfoLog(shader));
        return shader;
    };
    var useShader = function (painter, vshaderSource, fshaderSource) {
        var vertexShader = loadShader(painter, painter.VERTEX_SHADER, vshaderSource);
        var fragmentShader = loadShader(painter, painter.FRAGMENT_SHADER, fshaderSource);
        var glProgram = painter.createProgram();
        painter.attachShader(glProgram, vertexShader);
        painter.attachShader(glProgram, fragmentShader);
        painter.linkProgram(glProgram);
        if (!painter.getProgramParameter(glProgram, painter.LINK_STATUS))
            throw new Error('Failed to link program: ' + painter.getProgramInfoLog(glProgram));
        return glProgram;
    };
    var ShaderObject = (function () {
        function ShaderObject(painter) {
            this.__painter = painter;
        }
        ShaderObject.prototype.use = function () {
            this.__painter.useProgram(this.program);
            return this;
        };
        ShaderObject.prototype.compile = function (vshaderSource, fshaderSource) {
            this.program = useShader(this.__painter, vshaderSource, fshaderSource);
            return this;
        };
        return ShaderObject;
    }());

    var initTexture = function (painter, type, unit) {
        var texture = painter.createTexture();
        painter.activeTexture(painter['TEXTURE' + unit]);
        painter.bindTexture(type, texture);
        return texture;
    };
    var linkImage = function (painter, type, level, format, textureType, image) {
        painter.texImage2D(type, level, format, format, textureType, image);
    };
    var linkCube = function (painter, type, level, format, textureType, images, width, height, texture) {
        var types = [
            painter.TEXTURE_CUBE_MAP_POSITIVE_X,
            painter.TEXTURE_CUBE_MAP_NEGATIVE_X,
            painter.TEXTURE_CUBE_MAP_POSITIVE_Y,
            painter.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            painter.TEXTURE_CUBE_MAP_POSITIVE_Z,
            painter.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        var target;
        for (var i = 0; i < types.length; i++) {
            if (images[i]) {
                target = types[i];
                painter.texImage2D(target, level, format, width, height, 0, format, textureType, null);
                painter.bindTexture(type, texture);
                painter.texImage2D(target, level, format, format, textureType, images[i]);
            }
        }
        painter.generateMipmap(type);
    };
    var TextureObject = (function () {
        function TextureObject(painter, type, unit) {
            if (unit === void 0) { unit = 0; }
            this.__painter = painter;
            this.__type = {
                "2d": painter.TEXTURE_2D,
                "cube": painter.TEXTURE_CUBE_MAP
            }[type];
            this.__texture = initTexture(painter, this.__type, unit);
            painter.texParameteri(this.__type, painter.TEXTURE_MIN_FILTER, painter.NEAREST);
            painter.texParameteri(this.__type, painter.TEXTURE_MAG_FILTER, painter.NEAREST);
            painter.texParameteri(this.__type, painter.TEXTURE_WRAP_S, painter.CLAMP_TO_EDGE);
            painter.texParameteri(this.__type, painter.TEXTURE_WRAP_T, painter.CLAMP_TO_EDGE);
        }
        TextureObject.prototype.useImage = function (image) {
            linkImage(this.__painter, this.__type, 0, this.__painter.RGBA, this.__painter.UNSIGNED_BYTE, image);
            return this;
        };
        TextureObject.prototype.useCube = function (images, width, height) {
            linkCube(this.__painter, this.__type, 0, this.__painter.RGBA, this.__painter.UNSIGNED_BYTE, images, width, height, this.__texture);
            return this;
        };
        return TextureObject;
    }());

    var newBuffer = function (painter) {
        return painter.createBuffer();
    };
    var writeBuffer = function (painter, data, isElement, usage) {
        var TYPE = isElement ? painter.ELEMENT_ARRAY_BUFFER : painter.ARRAY_BUFFER;
        painter.bufferData(TYPE, data, usage);
    };
    var useBuffer = function (painter, location, size, type, stride, offset, normalized) {
        painter.vertexAttribPointer(location, size, type, normalized, stride, offset);
        painter.enableVertexAttribArray(location);
    };
    var BufferObject = (function () {
        function BufferObject(painter, isElement) {
            if (isElement === void 0) { isElement = false; }
            this.__painter = painter;
            this.__isElement = isElement;
            this.__buffer = newBuffer(painter);
            this.__type = isElement ? painter.ELEMENT_ARRAY_BUFFER : painter.ARRAY_BUFFER;
        }
        BufferObject.prototype.use = function () {
            this.__painter.bindBuffer(this.__type, this.__buffer);
            return this;
        };
        BufferObject.prototype.write = function (data) {
            writeBuffer(this.__painter, data, this.__isElement, this.__painter.STATIC_DRAW);
            this.__fsize = data.BYTES_PER_ELEMENT;
            return this;
        };
        BufferObject.prototype.divide = function (location, size, stride, offset) {
            if (offset === void 0) { offset = 0; }
            useBuffer(this.__painter, location, size, this.__painter.FLOAT, stride * this.__fsize, offset * this.__fsize, false);
            return this;
        };
        return BufferObject;
    }());

    var rotateX = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [x, y * cos - z * sin, y * sin + z * cos];
    };
    var rotateY = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [z * sin + x * cos, y, z * cos - x * sin];
    };
    var rotateZ = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [x * cos - y * sin, x * sin + y * cos, z];
    };
    var Eoap = (function () {
        function Eoap(scale, center) {
            if (scale === void 0) { scale = 7; }
            if (center === void 0) { center = [107, 36]; }
            this.name = 'Eoap';
            this.__scale = scale;
            this.__center = center;
        }
        Eoap.prototype.use = function (λ, φ) {
            var p = rotateY((360 - φ) / 180 * Math.PI, 100 * this.__scale, 0, 0);
            p = rotateZ(λ / 180 * Math.PI, p[0], p[1], p[2]);
            p = rotateZ((90 - this.__center[0]) / 180 * Math.PI, p[0], p[1], p[2]);
            p = rotateX((90 - this.__center[1]) / 180 * Math.PI, p[0], p[1], p[2]);
            return [
                -p[0],
                p[1],
                p[2]
            ];
        };
        return Eoap;
    }());

    var Mercator = (function () {
        function Mercator(scale, center) {
            if (scale === void 0) { scale = 7; }
            if (center === void 0) { center = [107, 36]; }
            this.name = 'Mercator';
            var perimeter = 100 * scale * Math.PI;
            var help = perimeter / 180;
            var cx = help * center[0];
            var cy = -1 * help * center[1];
            this.use = function (λ, φ) {
                return [
                    (help * λ - cx) * 0.8,
                    -1 * help * φ - cy,
                    0
                ];
            };
        }
        return Mercator;
    }());

    function throttle (callback, option) {
        if (option === void 0) { option = {}; }
        option = mergeOption(option, {
            time: 200,
            keep: false,
            opportunity: "end"
        });
        var hadInterval = false;
        var hadClick = false;
        var oneClick = false;
        var arg;
        return function () {
            var _this = this;
            arg = arguments;
            if (!hadInterval) {
                if (option.opportunity != 'end') {
                    callback.apply(_this, arg);
                }
                hadInterval = true;
                var interval_1 = setInterval(function () {
                    if (hadClick) {
                        if (!option.keep) {
                            callback.apply(_this, arg);
                        }
                    }
                    else {
                        if (option.opportunity != 'begin') {
                            if (oneClick || option.opportunity == 'end')
                                callback.apply(_this, arg);
                        }
                        hadInterval = false;
                        oneClick = false;
                        clearInterval(interval_1);
                    }
                    hadClick = false;
                }, option.time);
            }
            else {
                hadClick = true;
                oneClick = true;
            }
        };
    }

    var toInnerTree = (function (initTree, config) {
        var tempTree = {};
        var temp = config.root(initTree);
        var id, rid;
        id = rid = config.id(temp);
        tempTree[id] = {
            "data": temp,
            "pid": null,
            "id": id,
            "isOpen": true,
            "show": true,
            "children": []
        };
        var num = 1;
        (function createTree(pdata, pid) {
            var children = config.children(pdata, initTree);
            num += children ? children.length : 0;
            for (var flag = 0; children && flag < children.length; flag++) {
                id = config.id(children[flag]);
                tempTree[pid].children.push(id);
                tempTree[id] = {
                    "data": children[flag],
                    "pid": pid,
                    "id": id,
                    "isOpen": true,
                    "show": true,
                    "children": []
                };
                createTree(children[flag], id);
            }
        })(temp, id);
        return {
            rid: rid,
            value: tempTree,
            num: num
        };
    });

    function toPlainTree (initTree, config, noOpens) {
        var treeData = toInnerTree(initTree, config);
        var alltreedata = treeData.value;
        var rootid = treeData.rid;
        if (treeData.num == 1) {
            alltreedata[rootid].left = 0.5;
            alltreedata[rootid].top = 0.5;
            alltreedata[rootid].show = true;
            return {
                deep: 1,
                node: alltreedata,
                root: rootid,
                size: 1
            };
        }
        else {
            var beforeDis_1 = [];
            var size_1 = 0, maxDeep_1 = 0;
            if (noOpens[rootid]) {
                alltreedata[rootid].left = 0.5;
                alltreedata[rootid].top = 0.5;
                alltreedata[rootid].show = true;
                size_1 = 1;
            }
            else {
                (function positionCalc(pNode, deep) {
                    if (deep > maxDeep_1)
                        maxDeep_1 = deep;
                    var flag = 0;
                    if (!noOpens[pNode.id]) {
                        for (flag = 0; flag < pNode.children.length; flag++)
                            positionCalc(alltreedata[pNode.children[flag]], deep + 1);
                    }
                    alltreedata[pNode.id].left = deep + 0.5;
                    if (flag == 0) {
                        if (beforeDis_1[deep] == void 0)
                            beforeDis_1[deep] = -0.5;
                        if (beforeDis_1[deep - 1] == void 0)
                            beforeDis_1[deep - 1] = -0.5;
                        alltreedata[pNode.id].top = beforeDis_1[deep] + 1;
                        var pTop = beforeDis_1[deep] + 1 + (alltreedata[pNode.pid].children.length - 1) * 0.5;
                        if (pTop - 1 < beforeDis_1[deep - 1])
                            alltreedata[pNode.id].top = beforeDis_1[deep - 1] + 1 - (alltreedata[pNode.pid].children.length - 1) * 0.5;
                    }
                    else {
                        alltreedata[pNode.id].top = (alltreedata[pNode.children[0]].top + alltreedata[pNode.children[flag - 1]].top) * 0.5;
                    }
                    if (alltreedata[pNode.id].top <= beforeDis_1[deep]) {
                        var needUp_1 = beforeDis_1[deep] + 1 - alltreedata[pNode.id].top(function doUp(_pid, _deep) {
                            alltreedata[_pid].top += needUp_1;
                            if (beforeDis_1[_deep] < alltreedata[_pid].top)
                                beforeDis_1[_deep] = alltreedata[_pid].top;
                            for (var _flag = 0; _flag < alltreedata[_pid].children.length; _flag++) {
                                doUp(alltreedata[_pid].children[_flag], _deep + 1);
                            }
                        })(pNode.id, deep);
                    }
                    beforeDis_1[deep] = alltreedata[pNode.id].top;
                    if (alltreedata[pNode.id].top + 0.5 > size_1)
                        size_1 = alltreedata[pNode.id].top + 0.5;
                })(alltreedata[rootid], 0);
            }
            for (var key in noOpens) {
                if (noOpens[key]) {
                    alltreedata[key].isOpen = false;
                    (function updateHidden(pid, left, top) {
                        for (var index = 0; index < alltreedata[pid].children.length; index++) {
                            alltreedata[alltreedata[pid].children[index]].left = left;
                            alltreedata[alltreedata[pid].children[index]].top = top;
                            alltreedata[alltreedata[pid].children[index]].show = false;
                            updateHidden(alltreedata[pid].children[index], left, top);
                        }
                    })(key, alltreedata[key].left, alltreedata[key].top);
                }
            }
            return {
                "node": alltreedata,
                "root": rootid,
                "size": size_1,
                "deep": maxDeep_1 + 1
            };
        }
    }

    var Tree = (function () {
        function Tree(config) {
            if (config === void 0) { config = {}; }
            this.name = 'Tree';
            this.__config = mergeOption(config, {
                root: function (initTree) { return initTree; },
                children: function (parentTree) { return parentTree.children; },
                id: function (treedata) { return treedata.name; }
            });
        }
        Tree.prototype.use = function (initTree, noOpens) {
            if (noOpens === void 0) { noOpens = {}; }
            return toPlainTree(initTree, this.__config, noOpens);
        };
        return Tree;
    }());

    var TreeLayout = (function (_super) {
        __extends(TreeLayout, _super);
        function TreeLayout() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'TreeLayout';
            _this.__option = {
                offsetX: 0,
                offsetY: 0,
                duration: 500,
                type: "plain",
                direction: "LR",
                x: 100,
                y: 100,
                width: 100,
                height: 100,
                radius: 100
            };
            _this.__noOpens = {};
            return _this;
        }
        TreeLayout.prototype.setOption = function (option) {
            mergeOption(option, this.__option);
            return this;
        };
        TreeLayout.prototype.use = function (initTree, noOpens) {
            if (noOpens === void 0) { noOpens = {}; }
            var tree = _super.prototype.use.call(this, initTree, noOpens);
            if (this.__option.offsetX != 0 || this.__option.offsetY != 0) {
                for (var key in tree.node) {
                    if (!tree.node[key].show) {
                        var deep = 0, pid = key;
                        do {
                            pid = tree.node[pid].pid;
                            deep++;
                        } while (!tree.node[pid].show);
                        tree.node[key].left += this.__option.offsetX * deep;
                        tree.node[key].top += this.__option.offsetY * deep;
                    }
                }
            }
            if (this.__option.type == 'rect') {
                if (this.__option.direction == 'LR' || this.__option.direction == "RL") {
                    var perW = this.__option.height / tree.size;
                    var perD = this.__option.width / (tree.deep - 1);
                    var balanceW = this.__option.y - this.__option.height * 0.5;
                    var flag = this.__option.direction == 'LR' ? 1 : -1;
                    for (var key in tree.node) {
                        if (tree.deep == 1) {
                            tree.node[key].left = this.__option.x + this.__option.width * 0.5 * flag;
                            tree.node[key].top = this.__option.y;
                        }
                        else {
                            tree.node[key].left = this.__option.x + (tree.node[key].left - 0.5) * perD * flag;
                            tree.node[key].top = tree.node[key].top * perW + balanceW;
                        }
                    }
                }
                else if (this.__option.direction == 'TB' || this.__option.direction == "BT") {
                    var perW = this.__option.width / tree.size;
                    var perD = this.__option.height / (tree.deep - 1);
                    var balanceW = this.__option.x - this.__option.width * 0.5;
                    var flag = this.__option.direction == 'TB' ? 1 : -1;
                    for (var key in tree.node) {
                        if (tree.deep == 1) {
                            tree.node[key].left = this.__option.x;
                            tree.node[key].top = this.__option.y + this.__option.height * 0.5 * flag;
                        }
                        else {
                            var left = tree.node[key].left;
                            tree.node[key].left = tree.node[key].top * perW + balanceW;
                            tree.node[key].top = this.__option.y + (left - 0.5) * perD * flag;
                        }
                    }
                }
            }
            else if (this.__option.type == 'circle') {
                var cx = this.__option.x, cy = this.__option.y;
                var deg = Math.PI * 2 / tree.size;
                var per = this.__option.radius / (tree.deep - 1);
                for (var key in tree.node) {
                    if (tree.node[key].left == 0.5) {
                        tree.node[key].left = cx;
                        tree.node[key].top = cy;
                    }
                    else {
                        var position = rotate$1(cx, cy, deg * tree.node[key].top, cx + (tree.node[key].left - 0.5) * per, cy);
                        tree.node[key].left = position[0];
                        tree.node[key].top = position[1];
                    }
                }
            }
            return tree;
        };
        TreeLayout.prototype.bind = function (initTree, renderBack, noOpens) {
            if (noOpens === void 0) { noOpens = {}; }
            this.__rback = renderBack;
            this.__oralTree = initTree;
            this.__noOpens = noOpens;
            this.__preTree = this.use(this.__oralTree, this.__noOpens);
            this.__rback(this.__preTree);
            return this;
        };
        TreeLayout.prototype.unbind = function () {
            this.__rback = function () { return null; };
            this.__oralTree = null;
            this.__preTree = null;
            this.__noOpens = {};
            return this;
        };
        TreeLayout.prototype.doUpdate = function () {
            var _this = this;
            var newTree = this.use(this.__oralTree, this.__noOpens);
            var cacheTree = JSON.parse(JSON.stringify(newTree));
            animation(function (deep) {
                if (_this.__preTree) {
                    for (var key in cacheTree.node) {
                        if (newTree.node[key].show || _this.__preTree.node[key].show) {
                            cacheTree.node[key].show = true;
                            cacheTree.node[key].left = _this.__preTree.node[key].left + (newTree.node[key].left - _this.__preTree.node[key].left) * deep;
                            cacheTree.node[key].top = _this.__preTree.node[key].top + (newTree.node[key].top - _this.__preTree.node[key].top) * deep;
                        }
                    }
                }
                _this.__rback(cacheTree);
            }, this.__option.duration, function () {
                _this.__preTree = newTree;
                _this.__rback(_this.__preTree);
            });
        };
        TreeLayout.prototype.closeNode = function (id) {
            if (!this.__preTree)
                return this;
            this.__noOpens[id] = true;
            this.doUpdate();
            return this;
        };
        TreeLayout.prototype.openNode = function (id) {
            if (!this.__preTree)
                return this;
            this.__noOpens[id] = false;
            this.doUpdate();
            return this;
        };
        TreeLayout.prototype.toggleNode = function (id) {
            if (!this.__preTree)
                return this;
            this.__noOpens[id] = !this.__noOpens[id];
            this.doUpdate();
            return this;
        };
        return TreeLayout;
    }(Tree));

    var index = {
        Cardinal: Cardinal,
        Hermite: Hermite,
        Matrix4: Matrix4,
        rotate: rotate$1,
        move: move,
        scale: scale,
        getLoopColors: getLoopColors,
        animation: animation,
        ruler: ruler,
        SVG: SVG,
        Canvas: Canvas,
        RawCanvas: Canvas$1,
        getWebGLContext: getWebGLContext,
        Shader: ShaderObject,
        Texture: TextureObject,
        Buffer: BufferObject,
        Eoap: Eoap,
        Mercator: Mercator,
        throttle: throttle,
        TreeLayout: TreeLayout
    };

    return index;

}));
