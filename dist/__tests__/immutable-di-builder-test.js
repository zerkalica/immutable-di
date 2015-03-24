"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var proxyquire = _interopRequire(require("proxyquire"));

var NativeAdapter = _interopRequire(require("../state-adapters/native-adapter"));

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
        FakeGenericAdapter = undefined,
        testState = undefined;

    beforeEach(function () {
        testState = new NativeAdapter({
            a: {
                b: 123
            }
        });

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

    it("should call get method of container", function () {
        var di = Builder()(testState);
        di.get("test2");
        FakeContainer.get.should.have.been.calledWith("test2");
    });
});