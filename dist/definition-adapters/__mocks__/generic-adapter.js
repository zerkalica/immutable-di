"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _mocks__FixtureDefinition = require("../../__mocks__/fixture-definition");

var testFuncMeta = _mocks__FixtureDefinition.testFuncMeta;
var testFunc = _mocks__FixtureDefinition.testFunc;

var GenericAdapter = (function () {
    function GenericAdapter() {
        _classCallCheck(this, GenericAdapter);
    }

    _prototypeProperties(GenericAdapter, {
        extractMetaInfo: {
            value: function extractMetaInfo(definition) {
                return testFuncMeta;
            },
            writable: true,
            configurable: true
        },
        idFromDefinition: {
            value: function idFromDefinition(definition) {
                return testFunc;
            },
            writable: true,
            configurable: true
        }
    });

    return GenericAdapter;
})();

module.exports = GenericAdapter;