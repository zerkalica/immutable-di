'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = buildState;
exports['default'] = Selector;

function updateCursor(cursor, path) {
    var keys = _Object$keys(cursor);
    for (var i = 0; i < keys.length; i++) {
        var _key = keys[i];
        if (_key === '$') {
            cursor[_key].$path = path;
        } else {
            updateCursor(cursor[_key], path.concat(_key));
        }
    }
}

function buildState(stateSpec, createValidator) {
    var state = {};
    var pathMap = {};
    var schemas = {};
    var hasSchema = false;

    var keys = _Object$keys(stateSpec);
    for (var i = 0; i < keys.length; i++) {
        var _key2 = keys[i];
        var _stateSpec$_key2 = stateSpec[_key2];
        var schema = _stateSpec$_key2.schema;
        var defaults = _stateSpec$_key2.defaults;
        var _$ = _stateSpec$_key2.$;

        state[_key2] = defaults;
        if (schema) {
            hasSchema = true;
            schemas[_key2] = schema;
        }
        updateCursor(_$, [_key2]);
        var id = _$.$.$path[0];
        pathMap[id] = _key2;
    }

    return {
        state: state,
        pathMap: pathMap,
        validate: hasSchema ? createValidator(schemas) : undefined
    };
}

function Selector(_ref) {
    var stateSpec = _ref.stateSpec;
    var createValidator = _ref.createValidator;
    var Cursor = _ref.Cursor;
    var notify = _ref.notify;

    var _buildState = buildState(stateSpec, createValidator);

    var state = _buildState.state;
    var pathMap = _buildState.pathMap;
    var validate = _buildState.validate;

    var errors = validate ? validate([])(state) : [];
    if (errors.length) {
        throw new Error('State errors: ' + errors.join('\n'));
    }
    return function selector(pth) {
        var path = pth || [];
        var mappedId = pathMap[path[0]];
        var prefix = mappedId ? [mappedId].concat(path.slice(1)) : path;

        return new Cursor({
            state: state,
            prefix: prefix,
            validate: validate ? validate(prefix) : undefined,
            notify: notify
        });
    };
}

module.exports = exports['default'];
//# sourceMappingURL=Selector.js.map