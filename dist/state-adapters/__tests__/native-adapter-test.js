"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var NativeAdapter = _interopRequire(require("../native-adapter"));

describe("state-adapters/native-adapter", function () {
    var testState = {
        a: {
            b: {
                name: "test-name"
            }
        }
    };
    describe("#getIn", function () {
        it("should get part of object by path", function () {
            var nativeAdapter = new NativeAdapter(testState);
            nativeAdapter.getIn(["a", "b"]).should.to.be.deep.equal(testState.a.b);
        });

        it("should throw error, if data in path not exists", function () {
            var nativeAdapter = new NativeAdapter(testState);
            (function () {
                return nativeAdapter.getIn(["a", "c", "b"]);
            }).should["throw"]();
            expect(nativeAdapter.getIn(["a", "c"])).to.be.undefined;
        });
    });
});