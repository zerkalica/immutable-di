'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _abstractAdapter = require('./abstract-adapter');

var _abstractAdapter2 = _interopRequireDefault(_abstractAdapter);

function getInPath(obj, bits) {
    if (bits) {
        try {
            for (var i = 0, j = bits.length; i < j; ++i) {
                obj = obj[bits[i]];
            }
        } catch (e) {
            e.message = e.message + ': ' + bits.join('.');
            throw e;
        }
    }

    return obj;
}

var NativeAdapter = (function (_AbstractStateAdapter) {
    function NativeAdapter(state) {
        _classCallCheck(this, NativeAdapter);

        _get(Object.getPrototypeOf(NativeAdapter.prototype), 'constructor', this).call(this, state);
        this._state = state || {};
    }

    _inherits(NativeAdapter, _AbstractStateAdapter);

    _createClass(NativeAdapter, [{
        key: 'get',
        value: function get(path) {
            return getInPath(this._state, path);
        }
    }, {
        key: 'set',
        value: function set(path, newState) {
            if (!path || !path.length) {
                this._state = newState;
            } else {
                var statePart = this.get(path.slice(0, -1));
                statePart[path[path.length - 1]] = newState;
            }
            return this;
        }
    }]);

    return NativeAdapter;
})(_abstractAdapter2['default']);

exports['default'] = NativeAdapter;
module.exports = exports['default'];