'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _sinon = require('sinon');

var _sinon2 = _interopRequireWildcard(_sinon);

var _chai = require('chai');

var _chai2 = _interopRequireWildcard(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireWildcard(_chaiAsPromised);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireWildcard(_sinonChai);

function getClass(mock) {
    var methods = mock;
    var callbacks = {};

    var Class = _sinon2['default'].spy();
    Class.prototype.constructor = Class;

    if (!Array.isArray(mock)) {
        methods = Object.keys(mock);
    }

    (methods || []).forEach(function (method) {
        Class.prototype[method] = callbacks[method] || _sinon2['default'].spy();
    });

    return Class.prototype;
}

function init() {
    _chai2['default'].use(_chaiAsPromised2['default']);
    _chai2['default'].use(_sinonChai2['default']);
    _chai2['default'].should();
}

init();

exports['default'] = {
    init: init,
    sinon: _sinon2['default'],
    chai: _chai2['default'],
    describe: describe,
    it: it,
    getClass: getClass,
    spy: _sinon2['default'].spy,
    expect: _chai2['default'].expect
};
module.exports = exports['default'];