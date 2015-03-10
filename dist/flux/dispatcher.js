"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var actionToPromise = _interopRequire(require("./action-to-promise"));

var PromiseSeries = _interopRequire(require("./promise-series"));

var Dispatcher = (function () {
    function Dispatcher(_ref) {
        var container = _ref.container;
        var stores = _ref.stores;

        _classCallCheck(this, Dispatcher);

        this._container = container;
        this._stores = stores;
        this._series = new PromiseSeries();
    }

    _prototypeProperties(Dispatcher, null, {
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
                    return _this._getMutations(action);
                }).then(function (mutations) {
                    return _this._container.transformState(mutations);
                });
            },
            writable: true,
            configurable: true
        },
        _getMutations: {
            value: function _getMutations(_ref) {
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
        },
        reset: {
            value: function reset(state) {
                return this.dispatch("reset");
            },
            writable: true,
            configurable: true
        }
    });

    return Dispatcher;
})();

module.exports = Dispatcher;