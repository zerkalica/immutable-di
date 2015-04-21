"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

exports.__esModule = true;
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

    NativeAdapter.prototype.getIn = function getIn(path) {
        return getInPath(this._state, path);
    };

    NativeAdapter.prototype.get = function get(id) {
        return this._state[id];
    };

    NativeAdapter.prototype.deserialize = function deserialize(data) {
        this._state = JSON.parse(data);
        return this;
    };

    NativeAdapter.prototype.serialize = function serialize() {
        return JSON.stringify(this._state);
    };

    NativeAdapter.prototype.transformState = function transformState(transform) {
        var _this = this;

        return transform({
            get: function get(id) {
                return _this._state[id];
            },
            set: function set(id, newState) {
                _this._state[id] = newState;
            }
        });
    };

    return NativeAdapter;
})();

exports["default"] = NativeAdapter;
module.exports = exports["default"];