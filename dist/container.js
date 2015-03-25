"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Invoker = _interopRequire(require("./invoker"));

var _utils = require("./utils");

var bindAll = _utils.bindAll;
var convertArgsToOptions = _utils.convertArgsToOptions;

var Container = (function () {
    function Container(_ref) {
        var state = _ref.state;
        var metaInfoCache = _ref.metaInfoCache;
        var globalCache = _ref.globalCache;

        _classCallCheck(this, Container);

        var cache = this._cache = new Map();
        cache.set("global", globalCache || new Map());
        this._meta = metaInfoCache;
        this._state = state;
        this._locks = new Map();
        bindAll(this);
    }

    Container.__class = ["Container"];

    _prototypeProperties(Container, null, {
        clear: {
            value: function clear(scope) {
                this._getScope(scope).clear();
            },
            writable: true,
            configurable: true
        },
        _getScope: {
            value: function _getScope(scope) {
                var cache = this._cache.get(scope);
                if (cache === void 0) {
                    cache = new Map();
                    this._cache.set(scope, cache);
                }
                return cache;
            },
            writable: true,
            configurable: true
        },
        transformState: {
            value: function transformState(mutations) {
                var _this = this;

                var updatedScopes = this._state.transformState(mutations);
                updatedScopes.forEach(function (scope) {
                    return _this.clear(scope);
                });
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
                    container: this,
                    actionType: actionType,
                    getPayload: getPayload
                });
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(definition, debugCtx) {
                if (definition && this instanceof definition) {
                    return this;
                }

                var _meta$get = this._meta.get(definition, debugCtx);

                var id = _meta$get.id;
                var deps = _meta$get.deps;
                var handler = _meta$get.handler;
                var scope = _meta$get.scope;

                var debugPath = getDebugPath([debugCtx.length ? debugCtx[0] : [], id]);
                var cache = this._getScope(scope);
                var result = cache.get(id);
                if (result !== void 0) {
                    return result;
                }

                if (this._locks.get(id)) {
                    throw new Error("Recursive call detected in " + debugPath);
                }
                this._locks.set(id, true);
                var args = [];
                var argNames = [];
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    var value = undefined;
                    if (dep.path.length) {
                        try {
                            value = this._state.getIn(dep.path);
                            if (value === void 0) {
                                throw new Error("Value is undefined");
                            }
                        } catch (e) {
                            e.message = e.message + " in " + debugPath + " [" + dep.path.join(".") + "]";
                            throw e;
                        }
                    } else {
                        value = this.get(dep.definition, [debugPath, i]);
                        if (dep.promiseHandler) {
                            value = dep.promiseHandler(value);
                        }
                    }

                    args.push(value);
                    if (dep.name) {
                        argNames.push(dep.name);
                    }
                }

                result = Promise.all(args).then(function (resolvedArgs) {
                    return argNames.length ? handler(convertArgsToOptions(resolvedArgs, argNames)) : handler.apply(null, resolvedArgs);
                });

                this._locks.set(id, false);
                cache.set(id, result);

                return result;
            },
            writable: true,
            configurable: true
        }
    });

    return Container;
})();

module.exports = Container;