"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _genericAdapter = require("../generic-adapter");

var factory = _genericAdapter.factory;
var extractMetaInfo = _genericAdapter.extractMetaInfo;
var idFromDefinition = _genericAdapter.idFromDefinition;

var _mocks__FixtureDefinition = require("../../__mocks__/fixture-definition");

var testFuncMeta = _mocks__FixtureDefinition.testFuncMeta;
var testFunc = _mocks__FixtureDefinition.testFunc;
var testObjectDeps = _mocks__FixtureDefinition.testObjectDeps;
var testObjectDepsMeta = _mocks__FixtureDefinition.testObjectDepsMeta;

describe("definition-adapters/generic-adapter", function () {
    describe("factory", function () {
        var fn = undefined,
            deps = undefined;
        beforeEach(function () {
            var dep1 = function (s) {
                return s;
            };
            dep1.__factory = ["dep1"];
            deps = [dep1];
            fn = factory("test", deps);
        });

        it("should build __factory definition from params", function () {
            fn.should.include.keys("__factory");
        });

        it("should bind name and deps to __factory definition", function () {
            fn.__factory.should.to.be.deep.equal(["test", deps]);
        });

        it("should bind function to __factory from arguments", function () {
            var fn = function (p) {
                return p;
            };
            var fn2 = factory("test", deps, fn);
            fn2.should.to.be.equal(fn);
        });
    });

    describe("idFromDefinition", function () {
        it("should not accept empty or null", function () {
            var message = "Getter is not a definition in arg";
            (function () {
                return idFromDefinition();
            }).should.to["throw"](message);
            (function () {
                return idFromDefinition(null);
            }).should["throw"](message);
            (function () {
                return idFromDefinition(false);
            }).should["throw"](message);
            (function () {
                return idFromDefinition(0);
            }).should["throw"](message);
            (function () {
                return idFromDefinition("");
            }).should["throw"](message);
            (function () {
                return idFromDefinition([]);
            }).should["throw"](message);
            (function () {
                return idFromDefinition({});
            }).should["throw"](message);
        });

        it("should accept function", function () {
            function testFunc() {}
            testFunc.__factory = ["testFunc"];
            (function () {
                return idFromDefinition(testFunc);
            }).should.not["throw"]();
        });

        it("should return mappable id from function", function () {
            function testFunc() {}
            testFunc.__factory = ["testFunc"];
            idFromDefinition(testFunc).should.to.equal("testFunc");
        });
    });

    describe("extractMetaInfo", function () {
        it("should not accept empty or null", function () {
            var message = "Getter is not a definition in arg";
            (function () {
                return extractMetaInfo();
            }).should["throw"](message);
            (function () {
                return extractMetaInfo(null);
            }).should["throw"](message);
            (function () {
                return extractMetaInfo(false);
            }).should["throw"](message);
            (function () {
                return extractMetaInfo(0);
            }).should["throw"](message);
            (function () {
                return extractMetaInfo("");
            }).should["throw"](message);
            (function () {
                return extractMetaInfo([]);
            }).should["throw"](message);
            (function () {
                return extractMetaInfo({});
            }).should["throw"](message);
        });

        it("should throw error, if definition property is empty in argument", function () {
            var message = "Property .__factory or .__class not exist in function testFunc() {}";
            function testFunc() {}
            (function () {
                return extractMetaInfo(testFunc);
            }).should["throw"](message);
            testFunc.__factory = null;
            (function () {
                return extractMetaInfo(testFunc);
            }).should["throw"](message);
            testFunc.__factory = "";
            (function () {
                return extractMetaInfo(testFunc);
            }).should["throw"](message);
        });

        it("should throw error, if definition property is not an array in argument", function () {
            function testFunc() {}
            testFunc.__factory = {};
            var message = "Property .__factory or .__class is not an array in function testFunc() {}";
            (function () {
                return extractMetaInfo(testFunc);
            }).should["throw"](message);
        });

        it("should convert simple factory definition to metainfo", function () {
            function testFunc() {}
            testFunc.__factory = ["testFunc"];
            var meta = {
                id: "testFunc",
                scope: "state",
                handler: testFunc,
                deps: [],
                waitFor: [],
                name: "testFunc"
            };
            extractMetaInfo(testFunc).should.to.deep.equal(meta);
        });

        it("should convert simple class definition to metainfo", function () {
            var TestClass = function TestClass() {
                _classCallCheck(this, TestClass);
            };

            TestClass.__class = ["TestClass"];
            var meta = {
                id: TestClass,
                handler: TestClass,
                deps: [],
                waitFor: [],
                name: "TestClass"
            };
            var orig = extractMetaInfo(TestClass);

            orig.should.include.keys(["id", "handler", "deps", "waitFor", "name"]);

            orig.handler().should.to.be.instanceOf(TestClass);
        });

        it("should convert factory definition with deps as object to metainfo", function () {
            extractMetaInfo(testObjectDeps).should.to.deep.equal(testObjectDepsMeta);
        });

        it("should convert factory definition with deps as array to metainfo", function () {
            extractMetaInfo(testFunc).should.to.deep.equal(testFuncMeta);
        });
    });
});