"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var proxyquire = _interopRequire(require("proxyquire"));

function getClass(methods) {
    var Class = spy();
    Class.prototype.constructor = Class;
    (methods || []).forEach(function (method) {
        Class.prototype[method] = spy();
    });

    return Class.prototype;
}

describe("immutable-di-builder", function () {
    var Builder = undefined,
        FakeContainer = undefined,
        FakeInvoker = undefined,
        FakeMetaInfoCache = undefined,
        FakeGenericAdapter = undefined;
    var testState = {
        a: {
            b: 123
        }
    };

    beforeEach(function () {
        FakeContainer = getClass(["get", "clear"]);
        FakeInvoker = getClass();
        FakeMetaInfoCache = getClass();
        FakeGenericAdapter = getClass();
        Builder = proxyquire("../immutable-di-builder", {
            "./container": FakeContainer.constructor,
            "./invoker": FakeInvoker.constructor,
            "./meta-info-cache": FakeMetaInfoCache.constructor,
            "./definition-adapters/generic-adapter": FakeGenericAdapter.constructor
        });
    });

    it("should return factory for building ImmutableDi containers", function () {
        var fn = Builder();
        fn.should.a("function");
    });

    it("should build ImmutableDi container", function () {
        var fn = Builder();
        var m = sinon.match;
        fn(testState);
        FakeContainer.constructor.should.calledWith(m.has("state", testState).and(m.has("globalCache", m.instanceOf(Map))).and(m.has("metaInfoCache", m.instanceOf(FakeMetaInfoCache.constructor))));
    });

    it("should call clear scope of container", function () {
        var di = Builder()(testState);
        di.clear("test");
        FakeContainer.clear.should.have.been.calledWith("test");
    });

    it("should call get method of container", function () {
        var di = Builder()(testState);
        di.get("test2");
        FakeContainer.get.should.have.been.calledWith("test2");
    });

    it("should create invoker instance", function () {
        var m = sinon.match;
        var di = Builder()(testState);
        var testPayload = { test: 123 };
        var testAction = "testAction";
        di.createMethod(testAction, testPayload).should.be.instanceOf(FakeInvoker.constructor);
        FakeInvoker.constructor.should.have.been.calledWith(m.has("actionType", testAction).and(m.has("getPayload", testPayload)).and(m.has("container", m.instanceOf(FakeContainer.constructor))).and(m.has("metaInfoCache", m.instanceOf(FakeMetaInfoCache.constructor))));
    });
});