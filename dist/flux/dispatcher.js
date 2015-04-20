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
            info('mount definition: %o', definition);

            var _getDef = _Class$Def$getDef.getDef(definition);

            var id = _getDef.id;

            var listenerDef = _Class$Def$getDef.Def(function (p) {
                return p;
            }, {
                id: id + '__listener',
                deps: [definition],
                handler: function handler() {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return listener.apply(undefined, args);
                }
            });
            this._listeners.push(listenerDef);

            return listenerDef;
        }
    }, {
        key: 'unmount',
        value: function unmount(listenerDef) {
            info('mount definition: %o', listenerDef);
            this._listeners = this._listeners.filter(function (d) {
                return listenerDef !== d;
            });
        }
    }, {
        key: 'once',
        value: function once(definition) {
            var _this4 = this;

            var _getDef2 = _Class$Def$getDef.getDef(definition);

            var getter = _getDef2.getter;

            return new Promise((function (resolve) {
                info('once mount getter: %o', getter);
                var listenerDef = _this4.mount(getter, function (p) {
                    info('once unmount getter: %o', getter);
                    _this4.unmount(listenerDef);
                    resolve(p);
                });
            }).bind(this));
        }
    }, {
        key: '_handler',
        value: function _handler(p) {
            this._dispatcher.unmount(this._listenerDef);

            return autoListener;
        }
    }, {
        key: '_invokeListeners',
        value: function _invokeListeners() {
            var _this5 = this;

            this._listeners.forEach(function (listener) {
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
                if (state !== undefined) {
                    set(id, state);
                    updatedIds.push(id);
                }
            });

            return updatedIds;
        }
    }, {
        key: 'setState',
        value: function setState(newState) {
            var _this6 = this;

            this._container.transformState(function (p) {
                return _this6._stateTransformer(p, function (_ref4) {
                    var id = _ref4.id;
                    return newState[id];
                });
            });
            this._invokeListeners();
        }
    }, {
        key: '_transformState',
        value: function _transformState(action, payload) {
            var _this7 = this;

            this._container.transformState(function (p) {
                return _this7._stateTransformer(p, function (_ref5) {
                    var index = _ref5.index;
                    var id = _ref5.id;
                    var get = _ref5.get;
                    return _this7._stores[index].handle(get(id), action, payload);
                });
            });
            this._invokeListeners();
        }
    }]);

    return Dispatcher;
})();

exports['default'] = Dispatcher;

_Class$Def$getDef.Class(Dispatcher, [_Container2['default']]);
module.exports = exports['default'];