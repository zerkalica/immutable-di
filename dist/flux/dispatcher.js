'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _actionToPromise = require('./action-to-promise');

var _actionToPromise2 = _interopRequireWildcard(_actionToPromise);

var _PromiseSeries = require('./promise-series');

var _PromiseSeries2 = _interopRequireWildcard(_PromiseSeries);

var _Container = require('../container');

var _Container2 = _interopRequireWildcard(_Container);

var _Invoker = require('../invoker');

var _Invoker2 = _interopRequireWildcard(_Invoker);

var _Class$Def$getDef = require('../define');

var _debug = require('debug');

var _debug2 = _interopRequireWildcard(_debug);

var info = _debug2['default']('immutable-di:dispatcher');

var AutoUnmountListener = (function () {
    function AutoUnmountListener(_ref) {
        var listener = _ref.listener;
        var dispatcher = _ref.dispatcher;
        var definition = _ref.definition;

        _classCallCheck(this, AutoUnmountListener);

        this._handler = this._handler.bind(this);
        this._listener = listener;
        this._dispatcher = dispatcher;
        this._definition = definition;
        this._listenerDef = dispatcher.mount(definition, this._handler);
    }

    _createClass(AutoUnmountListener, [{
        key: '_handler',
        value: function _handler(state) {
            var result = this._listener({
                getter: this._definition,
                state: state,
                dispatcher: this._dispatcher
            });
            this._dispatcher.unmount(this._listenerDef);

            return result;
        }
    }]);

    return AutoUnmountListener;
})();

var Dispatcher = (function () {
    function Dispatcher(container) {
        _classCallCheck(this, Dispatcher);

        this._container = container || new _Container2['default']();
        this._series = new _PromiseSeries2['default']();
        this._listeners = [];
        this._stores = [];
        this._storeIds = [];

        this.setStores = this.setStores.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.dispatchAsync = this.dispatchAsync.bind(this);
        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);
    }

    _createClass(Dispatcher, [{
        key: 'setStores',
        value: function setStores(storeMap) {
            var stores = [];
            var keys = this._storeIds = Object.keys(storeMap);
            for (var i = 0; i < keys.length; i++) {
                stores.push(storeMap[keys[i]]);
            }
            this._stores = stores;
            return this;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(action, payload) {
            var _this = this;

            return this._series.add(function () {
                return _this.dispatchAsync(action, payload);
            });
        }
    }, {
        key: 'dispatchAsync',
        value: function dispatchAsync(action, payload) {
            var _this2 = this;

            var promiseAction = _actionToPromise2['default'](action, payload);
            var promise = this._invokeDispatch(promiseAction[0]);

            var _loop = function (i) {
                promise = promise.then(function () {
                    return _this2._invokeDispatch(promiseAction[i]);
                });
            };

            for (var i = 1; i < promiseAction.length; i++) {
                _loop(i);
            }

            return promise;
        }
    }, {
        key: '_invokeDispatch',
        value: function _invokeDispatch(actionPromise) {
            var _this3 = this;

            return actionPromise.then(function (_ref2) {
                var action = _ref2.action;
                var payload = _ref2.payload;
                return _this3._transformState(action, payload);
            });
        }
    }, {
        key: 'mount',
        value: function mount(definition, listener) {
            var _getDef = _Class$Def$getDef.getDef(definition);

            var id = _getDef.id;

            var listenerDef = _Class$Def$getDef.Def(function (p) {
                return p;
            }, {
                id: id + '__listener',
                deps: [definition],
                handler: function handler(p) {
                    return listener(p);
                }
            });
            this._listeners.push(listenerDef);

            return listenerDef;
        }
    }, {
        key: 'unmount',
        value: function unmount(listenerDef) {
            this._listeners = this._listeners.filter(function (d) {
                return listenerDef !== d;
            });
        }
    }, {
        key: 'once',
        value: function once(definition, listener) {
            var autoListener = new AutoUnmountListener({
                listener: listener,
                definition: definition,
                dispatcher: this
            });

            return autoListener;
        }
    }, {
        key: '_invokeListeners',
        value: function _invokeListeners() {
            var _this4 = this;

            this._listeners.forEach(function (listener) {
                return _this4._container.get(listener);
            });
        }
    }, {
        key: 'setState',
        value: function setState(newState) {
            var _this5 = this;

            this._container.transformState(function (_ref3) {
                var get = _ref3.get;
                var set = _ref3.set;

                var updatedIds = [];
                _this5._storeIds.forEach(function (id) {
                    set(id, newState[id]);
                    updatedIds.push(id);
                });

                return updatedIds;
            });
            this._invokeListeners();
        }
    }, {
        key: '_transformState',
        value: function _transformState(action, payload) {
            var _this6 = this;

            this._container.transformState(function (_ref4) {
                var get = _ref4.get;
                var set = _ref4.set;

                var updatedIds = [];
                _this6._stores.forEach(function (store, i) {
                    var id = _this6._storeIds[i];
                    var isUpdated = store.handle(get(id), action, payload);
                    if (isUpdated) {
                        updatedIds.push(id);
                    }
                });
                return updatedIds;
            });
            this._invokeListeners();
        }
    }]);

    return Dispatcher;
})();

exports['default'] = Dispatcher;

_Class$Def$getDef.Class(Dispatcher, [_Container2['default']]);
module.exports = exports['default'];
//set(id, newState)