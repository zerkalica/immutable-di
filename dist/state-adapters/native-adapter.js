"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

function getInPath(obj, bits) {
    for (var i = 0, j = bits.length; i < j; ++i) {
        var bit = bits[i];
        if (!obj.hasOwnProperty(bit)) {
            obj[bit] = {};
        }
        obj = obj[bit];
    }
    return obj;
}

var NativeAdapter = (function () {
    function NativeAdapter(state) {
        _classCallCheck(this, NativeAdapter);

        this._state = state || {};
    }

    _prototypeProperties(NativeAdapter, null, {
        getIn: {
            value: function getIn(path) {
                return getInPath(this._state, path);
            },
            writable: true,
            configurable: true
        }
    });

    return NativeAdapter;
})();

module.exports = NativeAdapter;