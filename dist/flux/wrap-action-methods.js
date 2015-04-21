"use strict";

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = wrapActionMethods;
function methodToConst(methodName) {
    return methodName;
}

function constToMethod(methodName) {
    return methodName;
}

function wrapActionMethods(o) {
    var obj = o.prototype;
    var keys = _Object$keys(obj);

    var _loop = function (i, l) {
        var methodName = keys[i];
        var fn = obj[methodName];
        obj[methodName] = function (key) {
            return (function (a1, a2, a3, a4, a5) {
                var result = fn(a1, a2, a3, a4, a5);
                if (result !== undefined) {
                    this.__dispatcher.dispatch(key, result);
                }
            })(methodToConst(methodName));
        };
    };

    for (var i = 0, l = keys.length; i < l; ++i) {
        _loop(i, l);
    }
}

module.exports = exports["default"];