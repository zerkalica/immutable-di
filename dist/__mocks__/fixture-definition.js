"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.depFn = depFn;
exports.waitFn1 = waitFn1;
exports.waitFn2 = waitFn2;
exports.testObjectDeps = testObjectDeps;
exports.testFunc = testFunc;
function depFn() {
    return new Promise(function (resolve) {
        return resolve("depFn.value");
    });
}
depFn.__factory = ["depFn"];

var DepClass = exports.DepClass = (function () {
    function DepClass() {
        _classCallCheck(this, DepClass);
    }

    _prototypeProperties(DepClass, null, {
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

DepClass.__class = ["DepClass", "state.a.b1"];

function waitFn1() {}
waitFn1.__factory = ["waitFn1"];
function waitFn2() {}
waitFn2.__factory = ["waitFn2"];

function testObjectDeps(_ref) {
    var depClass = _ref.depClass;
    var depFnValue = _ref.depFnValue;

    if (!(depClass instanceof DepClass)) {
        throw new Error("arg is not an instance of DepClass");
    }
    return "testFunc.value." + depClass.test() + "." + depFnValue;
}
testObjectDeps.__factory = ["testObjectDeps", { depFnValue: depFn, depClass: DepClass }];

var testObjectDepsMeta = exports.testObjectDepsMeta = {
    id: "testObjectDeps",
    name: "testObjectDeps",
    scope: "state",
    handler: testObjectDeps,
    deps: [{
        name: "depFnValue",
        definition: depFn,
        path: [],
        promiseHandler: null
    }, {
        name: "depClass",
        definition: DepClass,
        path: [],
        promiseHandler: null
    }],
    waitFor: []
};

function testFunc(depClass, depFnValue) {
    if (!(depClass instanceof DepClass)) {
        throw new Error("arg is not an instance of DepClass");
    }
    return "testFunc.value." + depClass.test() + "." + depFnValue;
}
var ignore = function (p) {
    return p["catch"](function () {});
};
testFunc.__factory = ["testFunc", DepClass, [depFn, ignore], "state.a.b"];
testFunc.__waitFor = [waitFn1, waitFn2];

var testFuncMeta = exports.testFuncMeta = {
    id: "testFunc",
    handler: testFunc,
    deps: [{
        name: void 0,
        definition: DepClass,
        path: [],
        promiseHandler: null
    }, {
        name: void 0,
        definition: depFn,
        path: [],
        promiseHandler: ignore
    }, {
        name: void 0,
        definition: null,
        path: ["state", "a", "b"],
        promiseHandler: null
    }],
    waitFor: [{
        name: void 0,
        definition: waitFn1,
        path: [],
        promiseHandler: null
    }, {
        name: void 0,
        definition: waitFn2,
        path: [],
        promiseHandler: null
    }],
    scope: "state",
    name: "testFunc"
};
Object.defineProperty(exports, "__esModule", {
    value: true
});