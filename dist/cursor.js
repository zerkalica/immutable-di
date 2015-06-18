'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _dispatcher2 = require('./dispatcher');

var _dispatcher3 = _interopRequireDefault(_dispatcher2);

var _container2 = require('./container');

var _container3 = _interopRequireDefault(_container2);

var _define = require('./define');

var Cursor = (function () {
    function Cursor(dispatcher, container) {
        var async = arguments[2] === undefined ? true : arguments[2];
        var prefix = arguments[3] === undefined ? [] : arguments[3];

        _classCallCheck(this, _Cursor);

        this._dispatcher = dispatcher;
        this._container = container;
        this._prefix = prefix;
        this._async = async;
        this._timeOutInProgress = false;
    }

    var _Cursor = Cursor;

    _createClass(_Cursor, [{
        key: 'select',
        value: function select(path) {
            return new Cursor(this._dispatcher, this._container, this._async, this._prefix.concat(path));
        }
    }, {
        key: 'set',
        value: function set(path, fn) {
            var _this = this;

            var transform = typeof fn === 'function' ? fn : function () {
                return fn;
            };
            var p = this._prefix.concat(path);
            this._container.transformState(function (state) {
                return state.set(p, transform(state.get(p)));
            });

            if (this._async && !this._timeOutInProgress) {
                this._timeOutInProgress = true;
                setTimeout(function () {
                    _this._updateListeners();
                    _this._timeOutInProgress = false;
                }, 0);
            } else {
                this._updateListeners();
            }
        }
    }, {
        key: '_updateListeners',
        value: function _updateListeners() {
            var _this2 = this;

            this._dispatcher.getListeners().forEach(function (listener) {
                return _this2._container.get(listener);
            });
        }
    }, {
        key: 'get',
        value: function get(path) {
            return this._container._state.get(this._prefix.concat(path));
        }
    }]);

    Cursor = (0, _define.Class)([_dispatcher3['default'], _container3['default']])(Cursor) || Cursor;
    return Cursor;
})();

exports['default'] = Cursor;
module.exports = exports['default'];