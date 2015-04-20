'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.isPromise = isPromise;
exports.getDebugPath = getDebugPath;
exports.classToFactory = classToFactory;

function isPromise(data) {
    return false;
}

function getDebugPath(debugPath, name) {
    return 'getDebugPath.mock';
}

function classToFactory(Constructor, args) {
    return function () {
        return new Constructor(args);
    };
}