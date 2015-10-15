'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = createTcombValidator;

var _tcomb = require('tcomb');

var _tcombValidation = require('tcomb-validation');

function formatErrors(errors) {
    return errors.map(function (error) {
        return error.message;
    });
}

function getSubSchema(schema, path) {
    var ptr = schema;
    for (var i = 0; i < path.length; i++) {
        ptr = ptr.meta.props[path[i]];
    }
    return ptr;
}

function createTcombValidator(rawSchema) {
    var schema = (0, _tcomb.struct)(rawSchema, 'State');
    return function createValidator(path) {
        var subSchema = getSubSchema(schema, path);
        return function _validate(data, key) {
            var schemaPart = getSubSchema(subSchema, key ? [key] : []);
            return schemaPart ? formatErrors((0, _tcombValidation.validate)(data, schemaPart, path).errors) : [];
        };
    };
}

module.exports = exports['default'];
//# sourceMappingURL=createTcombValidator.js.map