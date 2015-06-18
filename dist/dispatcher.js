'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _define = require('./define');

var Dispatcher = (function () {
    function Dispatcher() {
        _classCallCheck(this, _Dispatcher);

        this._listeners = [];
        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);
    }

    var _Dispatcher = Dispatcher;

    _createClass(_Dispatcher, [{
        key: 'getListeners',
        value: function getListeners() {
            return this._listeners;
        }
    }, {
        key: 'mount',
        value: function mount(stateMap, listener, id) {
            var mountedListener = (0, _define.Factory)(stateMap, id)(listener);
            this._listeners.push(mountedListener);

            return mountedListener;
        }
    }, {
        key: 'unmount',
        value: function unmount(listenerDef) {
            this._listeners = this._listeners.filter(function (d) {
                return listenerDef !== d;
            });

            return this;
        }
    }, {
        key: 'once',
        value: function once(definition, listener) {
            var _this = this;

            var listenerDef = this.mount(definition, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                _this.unmount(listenerDef);
                return listener.apply(undefined, args);
            });

            return this;
        }
    }]);

    Dispatcher = (0, _define.Class)()(Dispatcher) || Dispatcher;
    return Dispatcher;
})();

exports['default'] = Dispatcher;