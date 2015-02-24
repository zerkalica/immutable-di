"use strict";

module.exports = ImmutableDiBuilder;
var Container = babelHelpers.interopRequire(require("./container"));
var Invoker = babelHelpers.interopRequire(require("./invoker"));
var MetaInfoCache = babelHelpers.interopRequire(require("./meta-info-cache"));
var GenericAdapter = babelHelpers.interopRequire(require("./definition-adapters/generic-adapter"));

var ImmutableDi = (function () {
    function ImmutableDi(_ref) {
        var state = _ref.state;
        var globalCache = _ref.globalCache;
        var metaInfoCache = _ref.metaInfoCache;
        babelHelpers.classCallCheck(this, ImmutableDi);

        this._meta = metaInfoCache;

        this._container = new Container({
            state: state,
            metaInfoCache: this._meta,
            globalCache: globalCache
        });
    }

    babelHelpers.prototypeProperties(ImmutableDi, null, {
        clear: {
            value: function clear(scope) {
                this._container.clear(scope);
            },
            writable: true,
            configurable: true
        },
        createMethod: {
            value: function createMethod(actionType, payload) {
                return new Invoker({
                    metaInfoCache: this._meta,
                    container: this._container,
                    actionType: actionType,
                    payload: payload
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

function ImmutableDiBuilder() {
    var cache = new Map();
    var meta = new MetaInfoCache(GenericAdapter);

    return function (state) {
        return new ImmutableDi({
            state: state,
            globalCache: cache,
            metaInfoCache: meta
        });
    };
}