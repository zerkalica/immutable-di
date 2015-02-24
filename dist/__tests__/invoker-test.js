"use strict";

var Invoker = babelHelpers.interopRequire(require("../invoker"));
var Container = babelHelpers.interopRequire(require("../container"));
var MetaInfoCache = babelHelpers.interopRequire(require("../meta-info-cache"));
var NativeAdapter = babelHelpers.interopRequire(require("../state-adapters/native-adapter"));
var GenericAdapter = babelHelpers.interopRequire(require("../definition-adapters/generic-adapter"));

describe("invoker", function () {
    var state = {
        p: {
            a: "test-state-val"
        }
    };
    var globalCache = undefined;
    var getInvoker = undefined;

    beforeEach(function () {
        globalCache = new Map();
        var meta = new MetaInfoCache(GenericAdapter);
        var container = new Container({
            state: new NativeAdapter(state),
            metaInfoCache: meta,
            globalCache: globalCache
        });

        getInvoker = function (actionType, payload) {
            return new Invoker({
                metaInfoCache: meta,
                container: container,
                actionType: actionType,
                payload: payload
            });
        };
    });

    it("should handle simple store", function () {
        var fakeHandle = spy();
        var testAction = "testAction";
        var testPayload = { a: 1, b: 2 };

        var TestStore = (function () {
            function TestStore() {
                babelHelpers.classCallCheck(this, TestStore);
            }

            TestStore.__class = ["TestStore"];
            babelHelpers.prototypeProperties(TestStore, null, {
                handle: {
                    value: function handle(actionType, payload) {
                        return Promise.resolve(fakeHandle(actionType, payload));
                    },
                    writable: true,
                    configurable: true
                }
            });
            return TestStore;
        })();

        var invoker = getInvoker(testAction, testPayload);
        return invoker.handle(TestStore).then(function (d) {
            fakeHandle.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
        });
    });

    describe("deps and waitFor", function () {
        var fakeHandle = undefined;
        var fakeHandle1 = undefined;
        var fakeHandle2 = undefined;
        var testAction = "testAction";
        var testPayload = { a: 1, b: 2 };
        var invoker = undefined;

        var TestDep1 = (function () {
            function TestDep1() {
                babelHelpers.classCallCheck(this, TestDep1);
            }

            TestDep1.__class = ["TestDep1"];
            babelHelpers.prototypeProperties(TestDep1, null, {
                handle: {
                    value: function handle(actionType, payload) {
                        return Promise.resolve(fakeHandle1(actionType, payload));
                    },
                    writable: true,
                    configurable: true
                }
            });
            return TestDep1;
        })();

        var TestDep2 = (function () {
            function TestDep2() {
                babelHelpers.classCallCheck(this, TestDep2);
            }

            TestDep2.__class = ["TestDep2"];
            TestDep2.__waitFor = [TestDep1];
            babelHelpers.prototypeProperties(TestDep2, null, {
                handle: {
                    value: function handle(actionType, payload) {
                        return Promise.resolve(fakeHandle2(actionType, payload));
                    },
                    writable: true,
                    configurable: true
                }
            });
            return TestDep2;
        })();

        var TestStore = (function () {
            function TestStore() {
                babelHelpers.classCallCheck(this, TestStore);
            }

            TestStore.__class = ["TestStore"];
            TestStore.__waitFor = [TestDep2, TestDep1];
            babelHelpers.prototypeProperties(TestStore, null, {
                handle: {
                    value: function handle(actionType, payload) {
                        return Promise.resolve(fakeHandle(actionType, payload));
                    },
                    writable: true,
                    configurable: true
                }
            });
            return TestStore;
        })();

        beforeEach(function () {
            fakeHandle = spy();
            fakeHandle1 = spy();
            fakeHandle2 = spy();
            invoker = getInvoker(testAction, testPayload);
        });

        it("should cache handler calls", function () {
            return Promise.all([invoker.handle(TestDep2), invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1), invoker.handle(TestDep1)]).then(function (d) {
                fakeHandle1.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
                fakeHandle2.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
                fakeHandle.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
            });
        });

        it("should call with order store handlers", function () {
            return Promise.all([invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1)]).then(function (d) {
                sinon.assert.callOrder(fakeHandle1, fakeHandle2, fakeHandle);
            });
        });

        it("should produce the mutation result of passed definition", function () {
            var testResult = ["mut1", "mut2", "mut"];
            fakeHandle = function () {
                return "mut";
            };
            fakeHandle1 = function () {
                return "mut1";
            };
            fakeHandle2 = function () {
                return "mut2";
            };

            return Promise.all([invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1)]).then(function (d) {
                d[0].should.to.be.equal("mut");
                d[1].should.to.be.equal("mut2");
                d[2].should.to.be.equal("mut1");
            });
        });
    });
});