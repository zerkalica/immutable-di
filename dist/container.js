"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Container = (function () {
    function Container(_ref) {
        var state = _ref.state;
        var metaInfoCache = _ref.metaInfoCache;
        var globalCache = _ref.globalCache;

        _classCallCheck(this, Container);

        var cache = this._cache = new Map();
        cache.set("global", globalCache || new Map());
        cache.set("state", new Map());
        this._meta = metaInfoCache;
        this._state = state;
        this._locks = new Map();
    }

    _prototypeProperties(Container, null, {
        clear: {
            value: function clear(scope) {
                this._cache.get(scope).clear();
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(definition, debugCtx) {
                var _meta$get = this._meta.get(definition, debugCtx);

                var id = _meta$get.id;
                var deps = _meta$get.deps;
                var debugPath = _meta$get.debugPath;
                var handler = _meta$get.handler;
                var statePaths = _meta$get.statePaths;

                var cache = this._cache.get(statePaths.length ? "state" : "global");
                var result = cache.get(id);
                if (result !== void 0) {
                    return result;
                }

                if (this._locks.get(id)) {
                    throw new Error("Recursive call detected in " + debugPath);
                }
                this._locks.set(id, true);

                var args = [];
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    var value = undefined;
                    if (dep.path.length) {
                        value = this._state.getIn(dep.path);
                    } else {
                        value = this.get(dep.definition, [debugPath, i]);
                        if (dep.promiseHandler) {
                            value = dep.promiseHandler(value);
                        }
                    }

                    args.push(value);
                }

                result = Promise.all(args).then(function (resolvedArgs) {
                    return handler.apply(null, resolvedArgs);
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