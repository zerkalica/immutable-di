"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Container = _interopRequire(require("../container"));

var MetaInfoCache = _interopRequire(require("../meta-info-cache"));

var NativeAdapter = _interopRequire(require("../state-adapters/native-adapter"));

var GenericAdapter = _interopRequire(require("../definition-adapters/generic-adapter"));

var testFunc = require("../__mocks__/fixture-definition").testFunc;

describe("container", function () {
    var state = {
        state: { a: { b: 1, b1: 2 } },
        p: {
            a: "test-state-val"
        }
    };
    var globalCache = undefined;
    var container = undefined;

    beforeEach(function () {
        globalCache = new Map();
        container = new Container({
            state: new NativeAdapter(state),
            metaInfoCache: new MetaInfoCache(GenericAdapter),
            globalCache: globalCache
        });
    });

    describe("if wrong arguments passed", function () {
        it("should throw exception if no argument passed", function () {
            var msg = "Getter is not a definition in unk";
            (function () {
                return container.get();
            }).should["throw"](msg);
        });

        it("should throw exception if null argument passed", function () {
            var msg = "Getter is not a definition in unk";
            (function () {
                return container.get(null);
            }).should["throw"](msg);
            (function () {
                return container.get("");
            }).should["throw"](msg);
            (function () {
                return container.get(0);
            }).should["throw"](msg);
            (function () {
                return container.get(false);
            }).should["throw"](msg);
        });

        it("should throw exception if not service prototype passed", function () {
            function TestService() {}
            (function () {
                return container.get(TestService);
            }).should["throw"]();
        });

        it("should not throw exception if Container passed as prototype", function () {
            container.get(Container).should.equal(container);
        });

        it("should throw exception if no service name defined", function () {
            function TestService() {
                return 123;
            }
            (function () {
                return container.get(TestService);
            }).should["throw"]("Property .__factory or .__class not exist in unk");
        });
    });

    describe("if correct service prototype passed", function () {
        it("should instance simple service as promise", function () {
            function TestService() {
                return 1234;
            }
            TestService.__factory = ["TestService"];
            container.get(TestService).should.instanceOf(Promise);
        });

        it("should resolve deps for simple class", function () {
            function testFactory() {
                return new Promise(function (resolve) {
                    return resolve("testFactory.value");
                });
            }
            testFactory.__factory = ["testFactory"];

            var TestClass = (function () {
                function TestClass(testFactoryValue) {
                    _classCallCheck(this, TestClass);

                    this.tfv = testFactoryValue;
                }

                TestClass.__class = ["TestClass", testFactory];

                _prototypeProperties(TestClass, null, {
                    get: {
                        value: function get() {
                            return "TestClass." + this.tfv;
                        },
                        writable: true,
                        configurable: true
                    }
                });

                return TestClass;
            })();

            var v = container.get(TestClass).then(function (testClass) {
                return testClass.get();
            });

            return v.should.eventually.to.equal("TestClass.testFactory.value");
        });

        it("should instance complex service with deps and return value", function () {
            return container.get(testFunc).should.eventually.to.equal("testFunc.value.DepClass.value.depFn.value");
        });

        it("should resolve state path as dep", function () {
            var exampleValue = "test-va";

            function Dep(pa) {
                return exampleValue + "." + pa;
            }
            Dep.__factory = ["Dep", ["p", "a"]];

            return container.get(Dep).should.eventually.equal(exampleValue + "." + state.p.a);
        });

        it("should throw error, if path not found in state", function () {
            var exampleValue = "test-va";

            function Dep(pa) {
                return exampleValue + "." + pa;
            }
            Dep.__factory = ["Dep", ["f", "a"]];
            (function () {
                return container.get(Dep);
            }).should["throw"]();
        });

        it("should instance simple service and put it in global cache", function () {
            var exampleValue = "test";
            function TestService2() {
                return new Promise(function (resolve) {
                    return resolve(exampleValue);
                });
            }
            TestService2.__factory = ["TestService2"];
            container.get(TestService2);

            return globalCache.get("TestService2").should.eventually.equal(exampleValue);
        });

        it("should instance simple service and put it in state cache", function () {
            var exampleValue = "test-va";

            function Dep(pa) {
                return exampleValue + "." + pa;
            }
            Dep.__factory = ["Dep", ["p", "a"]];

            container.get(Dep);

            var localCache = container._cache.get("state");

            localCache.should.to.be.instanceOf(Map);

            return localCache.get("Dep").should.eventually.equal(exampleValue + "." + state.p.a);
        });

        it("should use cache, if called twice or more", function () {
            var Dep = spy();
            Dep.__factory = ["Dep", ["p", "a"]];

            return container.get(Dep).then(function (d) {
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledOnce;
            });
        });

        it("should compute state-depended value again after clear cache", function () {
            var Dep = spy();
            Dep.__factory = ["Dep", ["p", "a"]];

            return container.get(Dep).then(function (d) {
                container.clear("state");
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledTwice;
            });
        });

        it("should compute global-depended value again after clear cache", function () {
            var Dep = spy();
            Dep.__factory = ["Dep"];

            return container.get(Dep).then(function (d) {
                container.clear("global");
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledTwice;
            });
        });
    });

    describe("exception handling", function () {
        it("should return empty data, if service throws exception", function () {
            var exampleValue = "test-va";
            var testFallback = {
                test: "123"
            };
            function Dep(context) {
                throw new Error("test");
                return exampleValue;
            }
            Dep.__factory = ["Dep", ["p", "a"]];

            function TestService(dep) {
                return new Promise.resolve(dep);
            }
            TestService.__factory = ["TestService", [Dep, function (p) {
                return p["catch"](function (err) {
                    return testFallback;
                });
            }]];
            expect(container.get(TestService)).eventually.deep.equal(testFallback);
        });

        it("should filter exception, if service throws custom exception", function () {
            var testErr = { test: 123 };
            function Dep() {
                throw new ReferenceError("test");
            }
            Dep.__factory = ["Dep"];
            function TestService(dep) {
                return new Promise.resolve(dep);
            }
            TestService.__factory = ["TestService", [Dep, function (p) {
                return p["catch"](ReferenceError, function (err) {
                    return testErr;
                });
            }]];

            expect(container.get(TestService)).eventually.deep.equal(testErr);
        });
    });
});