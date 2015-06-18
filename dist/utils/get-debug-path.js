'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = getDebugPath;

function getDebugPath(args) {
    var _ref = args || [];

    var _ref2 = _slicedToArray(_ref, 2);

    var debugPath = _ref2[0];
    var name = _ref2[1];

    return (debugPath ? debugPath + '.' : '') + (name ? name : 'unk');
}

module.exports = exports['default'];