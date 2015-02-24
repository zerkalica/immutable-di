"use strict";

function getIn(obj, bits) {
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
        babelHelpers.classCallCheck(this, NativeAdapter);

        this._state = state || {};
    }

    babelHelpers.prototypeProperties(NativeAdapter, null, {
        getIn: {
            value: (function (_getIn) {
                var _getInWrapper = function getIn() {
                    return _getIn.apply(this, arguments);
                };

                _getInWrapper.toString = function () {
                    return _getIn.toString();
                };

                return _getInWrapper;
            })(function (path) {
                return getIn(this._state, path);
            }),
            writable: true,
            configurable: true
        }
    });
    return NativeAdapter;
})();

module.exports = NativeAdapter;