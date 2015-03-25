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
                debugCtx = debugCtx || [];
                var debugPath = getDebugPath(debugCtx);
                return this._adapter.extractMetaInfo(definition, debugPath);
            },
            writable: true,
            configurable: true
        }
    });

    return MetaInfoCache;
})();

module.exports = MetaInfoCache;