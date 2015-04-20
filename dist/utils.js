'use strict';

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getDebugPath = getDebugPath;
exports.classToFactory = classToFactory;
exports.convertArgsToOptions = convertArgsToOptions;
exports.getFunctionName = getFunctionName;

function getDebugPath(args) {
    var _ref = args || [];

    var _ref2 = _slicedToArray(_ref, 2);

    var debugPath = _ref2[0];
    var name = _ref2[1];

    return (debugPath ? debugPath + '.' : '') + (name ? name : 'unk');
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

function convertArgsToOptions(args, argsNames) {
    var obj = {};
    for (var i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i];
    }
    return obj;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FN_MAGIC = 'function';

function getFunctionName(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('));
}