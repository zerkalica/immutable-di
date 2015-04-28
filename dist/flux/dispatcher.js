'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _actionToPromise = require('./action-to-promise');

var _actionToPromise2 = _interopRequireWildcard(_actionToPromise);

var _PromiseSeries = require('./promise-series');

var _PromiseSeries2 = _interopRequireWildcard(_PromiseSeries);

var _Container = require('../container');

var _Container2 = _interopRequireWildcard(_Container);

var _Class$getDef$Factory$createGetter = require('../define');

var _debug = require('debug');

var _debug2 = _interopRequireWildcard(_debug);

var debug = _debug2['default']('immutable-di:dispatcher');

var Dispatcher = (function () {
    function Dispatcher(_ref) {
        var stores = _ref.stores;
        var state = _ref.state;
        var container = _ref.container;

        _classCallCheck(this, Dispatcher);

        this._container = container || new _Container2['default']({ state: state });
        this._series = new _PromiseSeries2['default']();
        this._listeners = [];
        this._stores = [];
        this._storeIds = [];

        this.setStores = this.setStores.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);
        this.dispatchAsync = this.dispatchAsync.bind(this);

        if (stores) {
            this.setStores(stores);
        }
    }

    Dispatcher.prototype.setStores = function setStores(storeMap) {
        var stores = [];
        var keys = this._storeIds = _Object$keys(storeMap);
        for (var i = 0; i < keys.length; i++) {
            stores.push(storeMap[keys[i]]);
        }
        this._stores = stores;
        return this;
    };

    Dispatcher.prototype.dispatch = function dispatch(action, payload) {
        var _this = this;

        _actionToPromise2['default'](action, payload).forEach(function (p) {
            return _this._series.add(function () {
                return p.then(function (o) {
                    return _this.dispatchAsync(o.action, o.payload);
                });
            });
        });

        return this._series.promise;
    };

    Dispatcher.prototype.dispatchAsync = function dispatchAsync(action, payload) {
        var _this2 = this;

        var handler = function handler(_ref2) {
            var index = _ref2.index;
            var id = _ref2.id;
            var get = _ref2.get;
            return _this2._stores[index].handle(get(id), action, payload);
        };
        debug('dispatchAsync %s:%o', action, payload);
        var updatedScopes = this._container.transformState(function (p) {
            return _this2._stateTransformer(p, handler);
        });
        return updatedScopes.length ? _Promise.all(this._listeners.map(this._container.getSync)) : false;
    };

    Dispatcher.prototype.mount = function mount(definition, listener) {
        var _getDef = _Class$getDef$Factory$createGetter.getDef(definition);

        var id = _getDef.id;

        this._listeners.push(_Class$getDef$Factory$createGetter.Factory(listener, [definition], id + '__listener'));

        return listener;
    };

    Dispatcher.prototype.unmount = function unmount(listenerDef) {
        this._listeners = this._listeners.filter(function (d) {
            return listenerDef !== d;
        });
    };

    Dispatcher.prototype.once = function once(definition, resolve) {
        var _this3 = this;

        if (Array.isArray(definition) || typeof definition === 'object') {
            definition = _Class$getDef$Factory$createGetter.createGetter(definition);
        }

        var _getDef2 = _Class$getDef$Factory$createGetter.getDef(definition);

        var getter = _getDef2.getter;

        var listenerDef = this.mount(getter, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this3.unmount(listenerDef);
            return resolve.apply(undefined, args);
        });

        return this;
    };

    Dispatcher.prototype._stateTransformer = function _stateTransformer(_ref3, getState) {
        var get = _ref3.get;
        var set = _ref3.set;

        return this._storeIds.filter(function (id, index) {
            var state = getState({ id: id, index: index, get: get });
            var isHandled = state !== undefined;
            if (isHandled) {
                set(id, state);
            }
            return isHandled;
        });
    };

    return Dispatcher;
})();

exports['default'] = Dispatcher;

_Class$getDef$Factory$createGetter.Class(Dispatcher, { container: _Container2['default'] });
module.exports = exports['default'];