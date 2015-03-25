"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var getDebugPath = require("./utils").getDebugPath;

var MetaInfoCache = (function () {
    function MetaInfoCache(adapter) {
        _classCallCheck(this, MetaInfoCache);

        this._adapter = adapter;
    }

    _prototypeProperties(MetaInfoCache, null, {
        get: {
            value: function get(definition, debugCtx) {
                var _this = this;

                debugCtx = debugCtx || [];
                var debugPath = getDebugPath(debugCtx);
                var meta = definition ? definition.__di_meta : void 0;

                if (!meta) {
                    (function () {
                        meta = _this._adapter.extractMetaInfo(definition, debugPath);
                        debugPath = getDebugPath([debugCtx[0], meta.name]);
                        var scopes = new Set();
                        var deps = meta.deps;
                        for (var i = 0; i < deps.length; i++) {
                            var dep = deps[i];
                            if (dep.path && dep.path.length) {
                                scopes.add(dep.path[0]);
                            } else {
                                var depMeta = _this.get(dep.definition, [debugPath, i]);
                                depMeta.scopes.forEach(function (path) {
                                    return scopes.add(path);
                                });
                            }
                        }

                        meta.scopes = Array.from(scopes.values());
                        meta.scope = meta.scopes.length ? meta.scopes[0] : "global";
                        definition.__di_meta = meta;
                    })();
                }

                return meta;
            },
            writable: true,
            configurable: true
        }
    });

    return MetaInfoCache;
})();

module.exports = MetaInfoCache;