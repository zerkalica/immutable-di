"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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