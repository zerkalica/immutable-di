"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Invoker = (function () {
    function Invoker(_ref) {
        var metaInfoCache = _ref.metaInfoCache;
        var container = _ref.container;
        var actionType = _ref.actionType;
        var getPayload = _ref.getPayload;

        _classCallCheck(this, Invoker);

        this._meta = metaInfoCache;
        this._actionType = actionType;
        this._getPayload = getPayload;
        this._container = container;
        this._cache = new Map();
    }

    _prototypeProperties(Invoker, null, {
        handle: {
            value: function handle(definition, debugCtx) {
                var _this = this;

                var _meta$get = this._meta.get(definition, debugCtx);

                var id = _meta$get.id;
                var waitFor = _meta$get.waitFor;
                var debugPath = _meta$get.debugPath;

                if (this._cache.has(id)) {
                    return this._cache.get(id);
                }

                var args = [];
                for (var i = 0, j = waitFor.length; i < j; i++) {
                    var dep = waitFor[i];
                    var value = this.handle(dep.definition, [debugPath, i]);
                    args.push(dep.promiseHandler ? dep.promiseHandler(value) : value);
                }
                var result = Promise.all(args).then(function (depsMutations) {
                    return _this._container.get(definition, debugCtx);
                }).then(function (instance) {
                    return instance.handle(_this._actionType, _this._getPayload(id));
                }).then(function (data) {
                    return { id: id, data: data };
                });

                this._cache.set(id, result);

                return result;
            },
            writable: true,
            configurable: true
        }
    });

    return Invoker;
})();

module.exports = Invoker;