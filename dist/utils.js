"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.getDebugPath = getDebugPath;
exports.classToFactory = classToFactory;
exports.bindAll = bindAll;
exports.convertArgsToOptions = convertArgsToOptions;
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

function bindAll(object) {
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
        var _name = keys[i];
        var prop = object[_name];
        if (object.hasOwnProperty(_name) && typeof prop === "function") {
            object[_name] = prop.bind(object);
        }
    }
}

function convertArgsToOptions(args, argsNames) {
    var obj = {};
    for (var i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i];
    }
    return obj;
}
Object.defineProperty(exports, "__esModule", {
    value: true
});