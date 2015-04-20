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

var _Class$Def$getDef = require('../define');

var _debug = require('debug');

var _debug2 = _interopRequireWildcard(_debug);

var info = _debug2['default']('immutable-di:dispatcher');

var Dispatcher = (function () {
    function Dispatcher(_ref) {
        var stores = _ref.stores;
        var stateAdapter = _ref.stateAdapter;
        var container = _ref.container;

        _classCallCheck(this, Dispatcher);

        this._container = container || new _Container2['default']({ state: stateAdapter });
        this._series = new _PromiseSeries2['default']();
        this._listeners = [];
        this._stores = [];
        this._storeIds = [];

        this.setStores = this.setStores.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.dispatchAsync = this.dispatchAsync.bind(this);
        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);

        if (stores) {
            this.setStores(stores);
        }
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

            var handler = function handler(p) {
                return listener(p);
            };
            var listenerDef = _Class$Def$getDef.Def(handler, {
                id: id + '__listener',
                deps: [definition],
                handler: handler
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
        value: function once(definition, resolve) {
            var _this4 = this;

            var _getDef2 = _Class$Def$getDef.getDef(definition);

            var getter = _getDef2.getter;

            var listenerDef = this.mount(getter, (function (p) {
                _this4.unmount(listenerDef);
                resolve(p);
            }).bind(this));
        }
    }, {
        key: '_invokeListeners',
        value: function _invokeListeners() {
            var _this5 = this;

            return this._listeners.map(function (listener) {
                return _this5._container.get(listener);
            });
        }
    }, {
        key: '_stateTransformer',
        value: function _stateTransformer(_ref3, getState) {
            var get = _ref3.get;
            var set = _ref3.set;

            var updatedIds = [];
            this._storeIds.forEach(function (id, index) {
                var state = getState({ id: id, index: index, get: get });
                if (state) {
                    if (state !== true) {
                        set(id, state);
                    }
                    updatedIds.push(id);
                }
            });

            return updatedIds;
        }
    }, {
        key: '_transformState',
        value: function _transformState(action, payload) {
            var _this6 = this;

            var handler = function handler(_ref4) {
                var index = _ref4.index;
                var id = _ref4.id;
                var get = _ref4.get;
                return _this6._stores[index].handle(get(id), action, payload);
            };
            info('_transformState %s:%o', action, payload);
            this._container.transformState(function (p) {
                return _this6._stateTransformer(p, handler);
            });
            return Promise.all(this._invokeListeners());
        }
    }]);

    return Dispatcher;
})();

exports['default'] = Dispatcher;

_Class$Def$getDef.Class(Dispatcher, {
    container: _Container2['default']
});
module.exports = exports['default'];