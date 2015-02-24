"use strict";

exports.depFn = depFn;
exports.waitFn1 = waitFn1;
exports.waitFn2 = waitFn2;
exports.testFunc = testFunc;
function depFn() {
    return new Promise(function (resolve) {
        return resolve("depFn.value");
    });
}
depFn.__factory = ["depFn"];

var DepClass = exports.DepClass = (function () {
    function DepClass() {
        babelHelpers.classCallCheck(this, DepClass);
    }

    babelHelpers.prototypeProperties(DepClass, null, {
        test: {
            value: function test() {
                return "DepClass.value";
            },
            writable: true,
            configurable: true
        }
    });
    return DepClass;
})();

DepClass.__class = ["DepClass", ["state", "a", "b1"]];

function waitFn1() {}
function waitFn2() {}

function testFunc(depClass, depFnValue) {
    if (!(depClass instanceof DepClass)) {
        throw new Error("arg is not an instance of DepClass");
    }
    return "testFunc.value." + depClass.test() + "." + depFnValue;
}
var ignore = function (p) {
    return p["catch"](function () {});
};
testFunc.__factory = ["testFunc", DepClass, [depFn, ignore], ["state", "a", "b"]];
testFunc.__waitFor = [waitFn1, waitFn2];

var testFuncMeta = exports.testFuncMeta = {
    id: "testFunc",
    handler: testFunc,
    deps: [{
        definition: DepClass,
        path: [],
        promiseHandler: null
    }, {
        definition: depFn,
        path: [],
        promiseHandler: ignore
    }, {
        definition: null,
        path: ["state", "a", "b"],
        promiseHandler: null
    }],
    waitFor: [{
        definition: waitFn1,
        path: [],
        promiseHandler: null
    }, {
        definition: waitFn2,
        path: [],
        promiseHandler: null
    }],
    name: "testFunc"
};
Object.defineProperty(exports, "__esModule", {
    value: true
});