'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _bind = require('babel-runtime/helpers/bind')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

var _utilsGetDebugPath = require('./utils/get-debug-path');

var _utilsGetDebugPath2 = _interopRequireDefault(_utilsGetDebugPath);

var _utilsConvertArgsToOptions = require('./utils/convert-args-to-options');

var _utilsConvertArgsToOptions2 = _interopRequireDefault(_utilsConvertArgsToOptions);

var _define = require('./define');

var _defineGet = require('./define/get');

var _defineGet2 = _interopRequireDefault(_defineGet);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('immutable-di:container');

var Container = (function () {
    function Container(state, cache) {
        _classCallCheck(this, _Container);

        this._cache = cache || new _Map();
        this._state = state;
        this.get = this.get.bind(this);
        this.getAsync = this.getAsync.bind(this);
        this.transformState = this.transformState.bind(this);
    }

    var _Container = Container;

    _createClass(_Container, [{
        key: 'transformState',
        value: function transformState(transform) {
            var transformer = new _transformer2['default'](this._state, this._cache);
            transform(transformer);
        }
    }, {
        key: '_getDepValue',
        value: function _getDepValue(dep, isSync, ctx) {
            var value = undefined;
            if (dep.path) {
                value = this._state.get(dep.path);
            } else {
                value = dep.isProto ? dep.definition : this.getAsync(dep.definition, isSync, ctx);

                if (dep.promiseHandler) {
                    value = dep.promiseHandler(value);
                }
            }

            return { value: value, name: dep.name };
        }
    }, {
        key: 'getAsync',
        value: function getAsync(definition, isSync, debugCtx) {
            if (definition) {
                if (this instanceof definition) {
                    return this;
                }
            } else {
                throw new Error('Getter is not a definition in ' + (0, _utilsGetDebugPath2['default'])(debugCtx || []));
            }

            var def = (0, _defineGet2['default'])(definition);
            if (!def) {
                throw new Error('Property .__id not exist in ' + (0, _utilsGetDebugPath2['default'])(debugCtx || []));
            }
            var id = def.id;
            var handler = def.handler;
            var deps = def.deps;
            var isClass = def.isClass;

            var debugPath = (0, _utilsGetDebugPath2['default'])([debugCtx && debugCtx.length ? debugCtx[0] : [], id]);
            var cache = this._cache;
            if (cache.has(id)) {
                return cache.get(id);
            }

            var args = [];
            var argNames = [];
            for (var i = 0; i < deps.length; i++) {
                var _getDepValue = this._getDepValue(deps[i], isSync, [debugPath, i]);

                var value = _getDepValue.value;
                var _name = _getDepValue.name;

                if (_name) {
                    argNames.push(_name);
                }
                args.push(value);
            }

            function createIntance(resolvedArgs) {
                var defArgs = argNames.length ? [(0, _utilsConvertArgsToOptions2['default'])(resolvedArgs, argNames)] : resolvedArgs;

                return isClass ? new (_bind.apply(definition, [null].concat(_toConsumableArray(defArgs))))() : definition.apply(undefined, _toConsumableArray(defArgs));
            }

            var result = isSync ? createIntance(args) : _Promise.all(args).then(createIntance);

            cache.set(id, result);

            return result;
        }
    }, {
        key: 'get',
        value: function get(definition) {
            return this.getAsync(definition, true);
        }
    }]);

    Container = (0, _define.Class)()(Container) || Container;
    return Container;
})();

exports['default'] = Container;
module.exports = exports['default'];