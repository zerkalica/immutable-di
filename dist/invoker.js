'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _getDef2 = require('./define');

var _getDebugPath = require('./utils');

var Invoker = (function () {
    function Invoker(_ref) {
        var container = _ref.container;
        var getState = _ref.getState;
        var action = _ref.action;
        var payload = _ref.payload;

        _classCallCheck(this, Invoker);

        this._action = action;
        this._getPayload = typeof payload === 'function' ? function (statePath) {
            return payload(statePath);
        } : function () {
            return payload;
        };
        this._container = container;
        this._cache = new Map();
        this._getState = getState;
    }

    _createClass(Invoker, [{
        key: 'handle',
        value: function handle(definition, debugCtx) {
            var _this = this;

            var _getDef = _getDef2.getDef(definition);

            var id = _getDef.id;
            var waitFor = _getDef.waitFor;
            var statePath = _getDef.statePath;

            waitFor = waitFor || [];
            var debugPath = _getDebugPath.getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id]);
            if (this._cache.has(id)) {
                return this._cache.get(id);
            }

            var args = [];
            for (var i = 0, j = waitFor.length; i < j; i++) {
                var dep = waitFor[i];
                var value = this.handle(dep.definition, [debugPath, i]);
                args.push(dep.promiseHandler ? dep.promiseHandler(value) : value);
            }
            var result = Promise.all(args).then(function () {
                return _this._container.get(definition, debugCtx);
            }).then(function (store) {
                return store.handle(_this._getState(statePath), _this._action, _this._getPayload(statePath));
            }).then(function (isHandled) {
                return { id: statePath, isHandled: isHandled };
            });

            this._cache.set(id, result);

            return result;
        }
    }]);

    return Invoker;
})();

exports['default'] = Invoker;
module.exports = exports['default'];