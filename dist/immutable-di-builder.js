"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = ImmutableDiBuilder;

var Container = _interopRequire(require("./container"));

var Invoker = _interopRequire(require("./invoker"));

var MetaInfoCache = _interopRequire(require("./meta-info-cache"));

var GenericAdapter = _interopRequire(require("./definition-adapters/generic-adapter"));

var Dispatcher = _interopRequire(require("./flux/dispatcher"));

var ImmutableDi = (function () {
    function ImmutableDi(_ref) {
        var _this = this;

        var state = _ref.state;
        var globalCache = _ref.globalCache;
        var metaInfoCache = _ref.metaInfoCache;
        var listeners = _ref.listeners;
        var stores = _ref.stores;

        _classCallCheck(this, ImmutableDi);

        this._meta = metaInfoCache;
        this._state = state;
        this._container = new Container({
            metaInfoCache: this._meta,
            state: state,
            globalCache: globalCache
        });
        this._listeners = listeners || [];
        this._dispatcher = new Dispatcher({
            container: this._container,
            stores: (stores || []).map(function (store) {
                return _this._container.get(store);
            })
        });
    }

    _prototypeProperties(ImmutableDi, null, {
        transformState: {
            value: function transformState(mutations) {
                var container = this._container;
                var updatedScopes = this._state.transformState(mutations);
                updatedScopes.forEach(function (scope) {
                    return container.clear(scope);
                });
                this._listeners.forEach(function (listener) {
                    return container.get(listener);
                });
            },
            writable: true,
            configurable: true
        },
        getDispatcher: {
            value: function getDispatcher() {
                return this._dispatcher;
            },
            writable: true,
            configurable: true
        },
        createMethod: {
            value: function createMethod(actionType, payload) {
                var _this = this;

                var getPayload = payload === void 0 ? function (id) {
                    return _this._state.get(id);
                } : function (id) {
                    return _this._payload;
                };

                return new Invoker({
                    metaInfoCache: this._meta,
                    container: this._container,
                    actionType: actionType,
                    getPayload: getPayload
                });
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(definition) {
                return this._container.get(definition);
            },
            writable: true,
            configurable: true
        }
    });

    return ImmutableDi;
})();

function ImmutableDiBuilder(listeners, stores) {
    var globalCache = new Map();
    var metaInfoCache = new MetaInfoCache(GenericAdapter);

    return function (state) {
        return new ImmutableDi({
            state: state,
            listeners: listeners,
            stores: stores,
            globalCache: globalCache,
            metaInfoCache: metaInfoCache
        });
    };
}