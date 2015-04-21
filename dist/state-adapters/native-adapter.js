"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

    _createClass(NativeAdapter, [{
        key: "getIn",
        value: function getIn(path) {
            return getInPath(this._state, path);
        }
    }, {
        key: "get",
        value: function get(id) {
            return this._state[id];
        }
    }, {
        key: "deserialize",
        value: function deserialize(data) {
            this._state = JSON.parse(data);
            return this;
        }
    }, {
        key: "serialize",
        value: function serialize() {
            return JSON.stringify(this._state);
        }
    }, {
        key: "transformState",
        value: function transformState(transform) {
            var _this = this;

            return transform({
                get: function get(id) {
                    return _this._state[id];
                },
                set: function set(id, newState) {
                    _this._state[id] = newState;
                }
            });
        }
    }]);

    return NativeAdapter;
})();

exports["default"] = NativeAdapter;
module.exports = exports["default"];