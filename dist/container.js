'use strict';

var _bind = Function.prototype.bind;

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _getDebugPath$convertArgsToOptions = require('./utils');

var _Class$getDef = require('./define');

var Container = (function () {
    function Container(_ref) {
        var state = _ref.state;
        var globalCache = _ref.globalCache;

        _classCallCheck(this, Container);

        var cache = this._cache = new Map();
        cache.set('global', globalCache || new Map());
        this._state = state;

        this.get = this.get.bind(this);
        this.clear = this.clear.bind(this);
        this.transformState = this.transformState.bind(this);
    }

    _createClass(Container, [{
        key: 'clear',
        value: function clear(scope) {
            this._getScope(scope).clear();
        }
    }, {
        key: '_getScope',
        value: function _getScope(scope) {
            var cache = undefined;
            if (!this._cache.has(scope)) {
                cache = new Map();
                this._cache.set(scope, cache);
            } else {
                cache = this._cache.get(scope);
            }
            return cache;
        }
    }, {
        key: 'transformState',
        value: function transformState(getState) {
            var _this = this;

            this._state.transformState(getState).forEach(function (id) {
                return _this.clear(id);
            });
        }
    }, {
        key: 'get',
        value: function get(definition, isSync, debugCtx) {
            if (definition) {
                if (this instanceof definition) {
                    return this;
                }
            } else {
                throw new Error('Getter is not a definition in ' + _getDebugPath$convertArgsToOptions.getDebugPath(debugCtx || []));
            }

            var def = _Class$getDef.getDef(definition);
            if (!def) {
                throw new Error('Property .__id not exist in ' + _getDebugPath$convertArgsToOptions.getDebugPath(debugCtx || []));
            }
            var id = def.id;
            var handler = def.handler;
            var deps = def.deps;
            var scope = def.scope;
            var isClass = def.isClass;

            var debugPath = _getDebugPath$convertArgsToOptions.getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id]);
            var cache = this._getScope(scope);
            var result = cache.get(id);
            if (result !== undefined) {
                return result;
            }

            var args = [];
            var argNames = [];
            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                var value = undefined;
                if (dep.path) {
                    try {
                        value = this._state.getIn(dep.path);
                        if (value === undefined) {
                            throw new Error('Value is undefined');
                        }
                    } catch (e) {
                        e.message = e.message + ' in ' + debugPath + ' [' + dep.path.join('.') + ']';
                        throw e;
                    }
                } else {
                    value = dep.isProto ? dep.definition : this.get(dep.definition, isSync, [debugPath, i]);
                    if (dep.promiseHandler) {
                        value = dep.promiseHandler(value);
                    }
                }

                args.push(value);
                if (dep.name) {
                    argNames.push(dep.name);
                }
            }
            function createIntance(resolvedArgs) {
                var defArgs = argNames.length ? [_getDebugPath$convertArgsToOptions.convertArgsToOptions(resolvedArgs, argNames)] : resolvedArgs;
                return isClass ? new (_bind.apply(definition, [null].concat(_toConsumableArray(defArgs))))() : definition.apply(undefined, _toConsumableArray(defArgs));
            }

            result = isSync ? createIntance(args) : Promise.all(args).then(createIntance);

            cache.set(id, result);

            return result;
        }
    }, {
        key: 'getSync',
        value: function getSync(definition) {
            return this.get(definition, true);
        }
    }]);

    return Container;
})();

exports['default'] = Container;

_Class$getDef.Class(Container);
module.exports = exports['default'];