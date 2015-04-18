"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Invoker = _interopRequire(require("./invoker"));

var _utils = require("./utils");

var bindAll = _utils.bindAll;
var getDebugPath = _utils.getDebugPath;
var classToFactory = _utils.classToFactory;
var convertArgsToOptions = _utils.convertArgsToOptions;

var _define = require("./define");

var Class = _define.Class;
var getDef = _define.getDef;

var Container = (function () {
    function Container(_ref) {
        var state = _ref.state;
        var globalCache = _ref.globalCache;

        _classCallCheck(this, Container);

        var cache = this._cache = new Map();
        cache.set("global", globalCache || new Map());
        this._state = state;
        this._locks = new Map();
        bindAll(this);
    }

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
                var cache = undefined;
                if (!this._cache.has(scope)) {
                    cache = new Map();
                    this._cache.set(scope, cache);
                } else {
                    cache = this._cache.get(scope);
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

                var getPayload = payload === undefined ? function (id) {
                    return _this._state.get(id);
                } : function () {
                    return _this._payload;
                };

                return new Invoker({
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

                var _getDef = getDef(definition);

                var id = _getDef.id;
                var handler = _getDef.handler;
                var deps = _getDef.deps;
                var scope = _getDef.scope;

                var debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id]);
                var cache = this._getScope(scope);
                var result = cache.get(id);
                if (result !== undefined) {
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
                            if (value === undefined) {
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

Class(Container);