"use strict";

module.exports = wrapActionMethods;
function methodToConst(methodName) {
    return methodName;
}

function constToMethod(methodName) {
    return methodName;
}

function wrapActionMethods(o) {
    if (o.__wrapped) {
        return;
    }
    o.__wrapped = true;

    var obj = o.prototype;
    var keys = Object.keys(obj);

    for (var i = 0, l = keys.length; i < l; ++i) {
        (function (i, l) {
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
        })(i, l);
    }
}