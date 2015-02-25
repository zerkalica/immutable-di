"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var NativeAdapter = _interopRequire(require("../native-adapter"));

describe("state-adapters/native-adapter", function () {
    describe("#getIn", function () {
        it("should", function () {
            var testState = {
                a: {
                    b: {
                        name: "test-name"
                    }
                }
            };

            var nativeAdapter = new NativeAdapter(testState);
            nativeAdapter.getIn(["a", "b"]).should.to.be.deep.equal(testState.a.b);
        });
    });
});