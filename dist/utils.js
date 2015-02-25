"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.isPromise = isPromise;
exports.getDebugPath = getDebugPath;
exports.classToFactory = classToFactory;
function isPromise(data) {
    return typeof data === "object" && typeof data.then === "function";
}

function getDebugPath(args) {
    var _ref = args || [];

    var _ref2 = _slicedToArray(_ref, 2);

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