"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = ImmutableDiBuilder;

var Container = _interopRequire(require("./container"));

var Invoker = _interopRequire(require("./invoker"));

var MetaInfoCache = _interopRequire(require("./meta-info-cache"));

var GenericAdapter = _interopRequire(require("./definition-adapters/generic-adapter"));

var ImmutableDi = (function () {
    function ImmutableDi(_ref) {
        var state = _ref.state;
        var globalCache = _ref.globalCache;
        var metaInfoCache = _ref.metaInfoCache;

        _classCallCheck(this, ImmutableDi);

        this._meta = metaInfoCache;

        this._container = new Container({
            state: state,
            metaInfoCache: this._meta,
            globalCache: globalCache
        });
    }

    _prototypeProperties(ImmutableDi, null, {
        clear: {
            value: function clear(scope) {
                this._container.clear(scope);
            },
            writable: true,
            configurable: true
        },
        createMethod: {
            value: function createMethod(actionType, getPayload) {
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