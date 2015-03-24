"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var actionToPromise = _interopRequire(require("./action-to-promise"));

var PromiseSeries = _interopRequire(require("./promise-series"));

var Container = _interopRequire(require("../container"));

var bindAll = require("../utils").bindAll;

var Dispatcher = (function () {
    function Dispatcher(_ref) {
        var container = _ref.container;

        _classCallCheck(this, Dispatcher);

        this._container = container;
        this._series = new PromiseSeries();
        this._listeners = [];
        bindAll(this);
    }

    Dispatcher.__class = ["Dispatcher", Container];

    _prototypeProperties(Dispatcher, null, {
        setStores: {
            value: function setStores(stores) {
                this._stores = stores;
                return this;
            },
            writable: true,
            configurable: true
        },
        mount: {
            value: function mount(name, deps, onUpdate) {
                var definition = this._container.factory(name, deps, onUpdate);
                this._listeners.push(definition);

                return definition;
            },
            writable: true,
            configurable: true
        },
        unmount: {
            value: function unmount(definition) {
                this._listeners = this._listeners.filter(function (d) {
                    return definition === d;
                });
            },
            writable: true,
            configurable: true
        },
        _update: {
            value: function _update() {
                var _this = this;

                this._listeners.forEach(function (listener) {
                    return _this._container.get(listener);
                });
            },
            writable: true,
            configurable: true
        },
        dispatch: {
            value: function dispatch(actionType, payload) {
                var _this = this;

                return this._series.add(function () {
                    return _this.dispatchAsync(actionType, payload);
                });
            },
            writable: true,
            configurable: true
        },
        dispatchAsync: {
            value: function dispatchAsync(actionType, payload) {
                var _this = this;

                return actionToPromise(actionType, payload).then(function (action) {
                    return _this._getMutationsFromStores(action);
                }).then(function (mutations) {
                    return _this._container.transformState(mutations);
                }).then(function () {
                    return _this._update();
                });
            },
            writable: true,
            configurable: true
        },
        reset: {
            value: function reset() {
                return this.dispatch("reset");
            },
            writable: true,
            configurable: true
        },
        _getMutationsFromStores: {
            value: function _getMutationsFromStores(_ref) {
                var actionType = _ref.actionType;
                var payload = _ref.payload;
                var isError = _ref.isError;
                var isPromise = _ref.isPromise;

                var action = actionType + (isError ? "Fail" : isPromise ? "Success" : "");

                var method = this._container.createMethod(action, payload);
                var mutations = this._stores.map(function (store) {
                    return method.handle(store);
                });

                return Promise.all(mutations);
            },
            writable: true,
            configurable: true
        }
    });

    return Dispatcher;
})();

module.exports = Dispatcher;