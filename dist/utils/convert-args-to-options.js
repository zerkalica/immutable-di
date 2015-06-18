"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

_Object$defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = convertArgsToOptions;

function convertArgsToOptions(args, argsNames) {
    var obj = {};
    for (var i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i];
    }
    return obj;
}

module.exports = exports["default"];