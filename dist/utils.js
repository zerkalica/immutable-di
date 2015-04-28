'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

exports.__esModule = true;
exports.getDebugPath = getDebugPath;
exports.convertArgsToOptions = convertArgsToOptions;
exports.getFunctionName = getFunctionName;

function getDebugPath(args) {
    var _ref = args || [];

    var _ref2 = _slicedToArray(_ref, 2);

    var debugPath = _ref2[0];
    var name = _ref2[1];

    return (debugPath ? debugPath + '.' : '') + (name ? name : 'unk');
}

function convertArgsToOptions(args, argsNames) {
    var obj = {};
    for (var i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i];
    }
    return obj;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FN_MAGIC = 'function';

function getFunctionName(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('));
}