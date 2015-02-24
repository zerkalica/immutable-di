"use strict";

var getDebugPath = require("./utils").getDebugPath;

var MetaInfoCache = (function () {
    function MetaInfoCache(adapter) {
        babelHelpers.classCallCheck(this, MetaInfoCache);

        this._adapter = adapter;
        this._meta = new Map();
    }

    babelHelpers.prototypeProperties(MetaInfoCache, null, {
        get: {
            value: function get(definition, debugCtx) {
                var _this = this;

                debugCtx = debugCtx || [];
                var debugPath = getDebugPath(debugCtx);
                var id = this._adapter.idFromDefinition(definition, debugPath);
                var meta = this._meta.get(id);

                if (!meta) {
                    (function () {
                        meta = _this._adapter.extractMetaInfo(definition, debugPath);
                        debugPath = getDebugPath([debugCtx[0], meta.name]);
                        var statePaths = new Map();
                        var deps = meta.deps;
                        for (var i = 0; i < deps.length; i++) {
                            var dep = deps[i];
                            if (dep.path && dep.path.length) {
                                statePaths.set(dep.path.join("."), dep.path);
                            } else {
                                var depMeta = _this.get(dep.definition, [debugPath, i]);
                                depMeta.statePaths.forEach(function (path) {
                                    return statePaths.set(path.join("."), path);
                                });
                            }
                        }
                        meta.statePaths = Array.from(statePaths.values());
                        _this._meta.set(id, meta);
                    })();
                }

                meta.debugPath = getDebugPath([debugCtx[0], meta.name]);
                return meta;
            },
            writable: true,
            configurable: true
        }
    });
    return MetaInfoCache;
})();

module.exports = MetaInfoCache;