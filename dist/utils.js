"use strict";

exports.isPromise = isPromise;
exports.getDebugPath = getDebugPath;
exports.classToFactory = classToFactory;
function isPromise(data) {
    return typeof data === "object" && typeof data.then === "function";
}

function getDebugPath(args) {
    var _ref = args || [];

    var _ref2 = babelHelpers.slicedToArray(_ref, 2);

    var debugPath = _ref2[0];
    var name = _ref2[1];

    return (debugPath ? debugPath + "." : "") + (name ? name : "unk");
}

function classToFactory(Constructor) {
    function F(args) {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new F(args);
    };
}
Object.defineProperty(exports, "__esModule", {
    value: true
});