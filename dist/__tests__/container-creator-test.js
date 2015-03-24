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

describe("container-creator", function () {
    var Creator = undefined,
        FakeContainer = undefined,
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
        FakeMetaInfoCache = getClass();
        FakeGenericAdapter = getClass();
        Creator = proxyquire("../container-creator", {
            "./container": FakeContainer.constructor,
            "./meta-info-cache": FakeMetaInfoCache.constructor,
            "./definition-adapters/generic-adapter": FakeGenericAdapter.constructor
        });
    });

    it("should return factory for building ImmutableDi containers", function () {
        var creator = new Creator();

        creator.create.should.be.a("function");
    });

    it("should build ImmutableDi container", function () {
        var creator = new Creator();
        var m = sinon.match;
        creator.create(testState);
        FakeContainer.constructor.should.calledWith(m.has("state", testState).and(m.has("globalCache", m.instanceOf(Map))).and(m.has("metaInfoCache", m.instanceOf(FakeMetaInfoCache.constructor))));
    });

    it("should call get method of container", function () {
        var di = new Creator().create(testState);
        di.get("test2");
        FakeContainer.get.should.have.been.calledWith("test2");
    });
});