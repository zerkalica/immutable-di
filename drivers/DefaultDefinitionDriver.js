'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utilsGetFunctionName = require('../utils/getFunctionName');

var _utilsGetFunctionName2 = _interopRequireDefault(_utilsGetFunctionName);

var _AbstractDefinitionDriver2 = require('./AbstractDefinitionDriver');

var _AbstractDefinitionDriver3 = _interopRequireDefault(_AbstractDefinitionDriver2);

var _lastId = 1;
var _ids = {};
function _createId() {
    return _lastId++;
}

function _idFromString(dn) {
    if (!_ids[dn]) {
        _ids[dn] = _createId();
    }

    return _ids[dn];
}

var DefaultDefinitionDriver = (function (_AbstractDefinitionDriver) {
    _inherits(DefaultDefinitionDriver, _AbstractDefinitionDriver);

    function DefaultDefinitionDriver() {
        _classCallCheck(this, DefaultDefinitionDriver);

        _get(Object.getPrototypeOf(DefaultDefinitionDriver.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DefaultDefinitionDriver, [{
        key: 'add',
        value: function add(fn, definition) {
            if (!fn.__di) {
                var id = definition.id;
                if (!id) {
                    id = _createId();
                } else if (typeof id === 'string') {
                    id = _idFromString(id);
                }

                var displayName = definition.displayName || fn.displayName || (0, _utilsGetFunctionName2['default'])(fn) || 'id@' + id;
                fn.__di = _extends({}, definition, {
                    id: id,
                    displayName: displayName
                });
                fn.displayName = displayName;
            }
            return fn;
        }
    }, {
        key: 'getId',
        value: function getId(fn, debugCtx) {
            if (!fn || !fn.__di) {
                throw new Error('Property .__di not exist in ' + fn);
            }

            return fn.__di.id;
        }
    }, {
        key: '_normalizeDeps',
        value: function _normalizeDeps(deps, debugCtx) {
            var resultDeps = [];
            var isArray = Array.isArray(deps);
            var names = isArray ? [] : _Object$keys(deps);
            var len = isArray ? deps.length : names.length;
            var _annotations = this._annotations;
            var Path = _annotations.Path;
            var Cursor = _annotations.Cursor;

            for (var i = 0; i < len; i++) {
                var _name = names.length ? names[i] : undefined;
                var key = _name || i;
                var dep = deps[key];
                var definition = undefined;
                if (Array.isArray(dep)) {
                    definition = Path(dep);
                } else if (dep.$path) {
                    if (!Array.isArray(dep.$path)) {
                        throw new Error('Path not found in ' + JSON.stringify(dep) + ': ' + debugCtx.concat(key));
                    }
                    definition = Cursor(dep.$path);
                } else if (dep.$) {
                    if (!Array.isArray(dep.$.$path)) {
                        throw new Error('Model not registered in stateSpec: ' + debugCtx.concat(key));
                    }
                    definition = Path(dep.$.$path);
                } else {
                    definition = dep;
                }

                resultDeps.push({
                    name: _name,
                    definition: definition
                });
            }

            return resultDeps;
        }
    }, {
        key: 'getMeta',
        value: function getMeta(fn, debCtx) {
            var debugCtx = (debCtx || []).concat('@' + fn.displayName);
            var id = this.getId(fn, debugCtx);
            var def = fn.__di;
            var deps = def.deps || [];
            return _extends({}, def, {
                fn: fn,
                id: id,
                isOptions: !Array.isArray(deps),
                deps: this._normalizeDeps(deps, debugCtx)
            });
        }
    }]);

    return DefaultDefinitionDriver;
})(_AbstractDefinitionDriver3['default']);

exports['default'] = DefaultDefinitionDriver;
module.exports = exports['default'];
//# sourceMappingURL=DefaultDefinitionDriver.js.map