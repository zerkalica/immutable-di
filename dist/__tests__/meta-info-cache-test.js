"use strict";

var GenericAdapter = babelHelpers.interopRequire(require("../definition-adapters/generic-adapter"));

var _mocks__FixtureDefinition = require("../__mocks__/fixture-definition");

var testFuncMeta = _mocks__FixtureDefinition.testFuncMeta;
var testFunc = _mocks__FixtureDefinition.testFunc;
var MetaInfoCache = babelHelpers.interopRequire(require("../meta-info-cache"));

describe("meta-info-cache", function () {
    var meta = undefined;
    before(function () {
        meta = new MetaInfoCache(GenericAdapter);
    });
    it("should throw error if not a valid definition in argument", function () {
        function testF() {}
        (function () {
            return meta.get(testF);
        }).should["throw"]("Property .__factory or .__class not exist in unk");
    });
    it("should include definition keys", function () {
        var definition = meta.get(testFunc);
        definition.should.to.include.keys(["id", "handler", "name", "waitFor", "deps", "statePaths", "debugPath"]);
    });
    it("should have a valid debugPath", function () {
        var definition = meta.get(testFunc);
        definition.debugPath.should.be.equal("testFunc");
    });
    it("should have a valid statePaths", function () {
        var definition = meta.get(testFunc);
        definition.statePaths.should.be.deep.equal([["state", "a", "b1"], ["state", "a", "b"]]);
    });
    it("should have a valid definition", function () {
        var definition = meta.get(testFunc);
        delete definition.statePaths;
        delete definition.debugPath;
        definition.should.be.deep.equal(testFuncMeta);
    });
});