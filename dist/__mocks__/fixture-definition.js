"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.depFn = depFn;
exports.waitFn1 = waitFn1;
exports.waitFn2 = waitFn2;
exports.testObjectDeps = testObjectDeps;
exports.testFunc = testFunc;

var _define = require("../define");

var Factory = _define.Factory;
var Class = _define.Class;
var Promises = _define.Promises;
var WaitFor = _define.WaitFor;
function depFn() {
    return new Promise(function (resolve) {
        return resolve("depFn.value");
    });
}
Factory(depFn);

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

Class(DepClass, ["state.a.b"]);

function waitFn1() {}
Factory(waitFn1);
function waitFn2() {}
Factory(waitFn2);

function testObjectDeps(_ref) {
    var depClass = _ref.depClass;
    var depFnValue = _ref.depFnValue;

    if (!(depClass instanceof DepClass)) {
        throw new Error("arg is not an instance of DepClass");
    }
    return "testFunc.value." + depClass.test() + "." + depFnValue;
}
Factory(testObjectDeps, {
    depFnValue: depFn,
    depClass: DepClass
});

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
Factory(testFunc, [[depFn, Promises.ignore], "state.a.b"]);
WaitFor(testFunc, [waitFn1, waitFn2]);

var testFuncMeta = exports.testFuncMeta = {
    id: "testFunc",
    handler: testFunc,
    deps: [{
        name: undefined,
        definition: DepClass,
        path: [],
        promiseHandler: null
    }, {
        name: undefined,
        definition: depFn,
        path: [],
        promiseHandler: Promises.ignore
    }, {
        name: undefined,
        definition: null,
        path: ["state", "a", "b"],
        promiseHandler: null
    }],
    waitFor: [{
        name: undefined,
        definition: waitFn1,
        path: [],
        promiseHandler: null
    }, {
        name: undefined,
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