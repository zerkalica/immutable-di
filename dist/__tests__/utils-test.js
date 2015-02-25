"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _utils = require("../utils");

var isPromise = _utils.isPromise;
var getDebugPath = _utils.getDebugPath;
var classToFactory = _utils.classToFactory;

describe("utils", function () {
    describe("isPromise", function () {
        it("should return false if argument is not an object", function () {
            isPromise().should.to.be.not.ok;
            isPromise({}).should.to.be.not.ok;
            isPromise("").should.to.be.not.ok;
            isPromise(0).should.to.be.not.ok;
            isPromise(false).should.to.be.not.ok;
        });
        it("should return false if argument is no then property", function () {
            var testClass = function testClass() {
                _classCallCheck(this, testClass);
            };

            isPromise(new testClass()).should.to.be.not.ok;
        });
        it("should return true if argument is a object with then property", function () {
            var testClass = (function () {
                function testClass() {
                    _classCallCheck(this, testClass);
                }

                _prototypeProperties(testClass, null, {
                    then: {
                        value: function then() {},
                        writable: true,
                        configurable: true
                    }
                });

                return testClass;
            })();

            isPromise(new testClass()).should.to.be.ok;
        });
    });

    describe("classToFactory", function () {
        var TestC = function TestC() {
            _classCallCheck(this, TestC);
        };

        var TestC1 = function TestC1(a, b) {
            _classCallCheck(this, TestC1);

            if (a !== 1 || b !== 2) {
                throw new Error("Invalid arguments");
            }
            this.c = a + b;
        };

        it("should create function from class", function () {
            classToFactory(TestC).should.to.be["function"];
        });

        it("should create factory function, which returns instance of class", function () {
            classToFactory(TestC)().should.to.be.instanceOf(TestC);
        });

        it("should call constructor of original class", function () {
            var factory = classToFactory(TestC1);
            (function () {
                return factory();
            }).should.to["throw"]("Invalid arguments");
        });

        it("should pass arguments to constructor", function () {
            var factory = classToFactory(TestC1);
            (function () {
                return factory(1, 2);
            }).should.not.to["throw"]();
            expect(factory(1, 2).c).equal(3);
        });
    });

    describe("getDebugPath", function () {
        it("should return string", function () {
            getDebugPath().should.to.be.equal("unk");
            getDebugPath("").should.to.be.equal("unk");
            getDebugPath([]).should.to.be.equal("unk");
        });

        it("should return valid path, if only first argument supplied", function () {
            getDebugPath(["test"]).should.to.be.equal("test.unk");
        });
        it("should return valid path", function () {
            getDebugPath(["test", "q"]).should.to.be.equal("test.q");
        });
    });
});