'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _getDebugPath$classToFactory$convertArgsToOptions = require('./utils');

var _Class$getDef = require('./define');

var Container = (function () {
    function Container(_ref) {
        var state = _ref.state;
        var globalCache = _ref.globalCache;

        _classCallCheck(this, Container);

        var cache = this._cache = new Map();
        cache.set('global', globalCache || new Map());
        this._state = state;
        this._locks = new Map();

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
        value: function get(definition, debugCtx) {
            if (definition) {
                if (this instanceof definition) {
                    return this;
                }
            } else {
                throw new Error('Getter is not a definition in ' + _getDebugPath$classToFactory$convertArgsToOptions.getDebugPath(debugCtx || []));
            }

            var def = _Class$getDef.getDef(definition);
            if (!def) {
                throw new Error('Property .__id not exist in ' + _getDebugPath$classToFactory$convertArgsToOptions.getDebugPath(debugCtx || []));
            }
            var id = def.id;
            var handler = def.handler;
            var deps = def.deps;
            var scope = def.scope;

            var debugPath = _getDebugPath$classToFactory$convertArgsToOptions.getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id]);
            var cache = this._getScope(scope);
            var result = cache.get(id);
            if (result !== undefined) {
                return result;
            }

            if (this._locks.get(id)) {
                throw new Error('Recursive call detected in ' + debugPath);
            }
            this._locks.set(id, true);
            var args = [];
            var argNames = [];
            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                var value = undefined;
                if (dep.path) {
                    try {
                        value = this._state.getIn(dep.path);
                        if (value === undefined) {
                            throw new Error('Value is undefined in ' + dep.path);
                        }
                    } catch (e) {
                        e.message = e.message + ' in ' + debugPath + ' [' + dep.path.join('.') + ']';
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
                return argNames.length ? handler(_getDebugPath$classToFactory$convertArgsToOptions.convertArgsToOptions(resolvedArgs, argNames)) : handler.apply(null, resolvedArgs);
            });

            this._locks.set(id, false);
            cache.set(id, result);

            return result;
        }
    }]);

    return Container;
})();

exports['default'] = Container;

_Class$getDef.Class(Container);
module.exports = exports['default'];