"use strict";

var _mocks__FixtureDefinition = require("../../__mocks__/fixture-definition");

var testFuncMeta = _mocks__FixtureDefinition.testFuncMeta;
var testFunc = _mocks__FixtureDefinition.testFunc;

var GenericAdapter = (function () {
    function GenericAdapter() {
        babelHelpers.classCallCheck(this, GenericAdapter);
    }

    babelHelpers.prototypeProperties(GenericAdapter, {
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