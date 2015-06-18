"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

_Object$defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = getDef;

function getDef(Service) {
    return Service.__di;
}

module.exports = exports["default"];