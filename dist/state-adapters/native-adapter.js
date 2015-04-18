"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

function getInPath(obj, bits) {
    for (var i = 0, j = bits.length; i < j; ++i) {
        obj = obj[bits[i]];
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
        },
        get: {
            value: function get(id) {
                return this._state[id];
            },
            writable: true,
            configurable: true
        },
        transformState: {
            value: function transformState(mutations) {
                var updatedScopes = [];
                for (var i = 0; i < mutations.length; i++) {
                    var _mutations$i = mutations[i];
                    var id = _mutations$i.id;
                    var data = _mutations$i.data;

                    if (data !== undefined) {
                        updatedScopes.push(id);
                        this._state[id] = data;
                    }
                }
                return updatedScopes;
            },
            writable: true,
            configurable: true
        }
    });

    return NativeAdapter;
})();

module.exports = NativeAdapter;