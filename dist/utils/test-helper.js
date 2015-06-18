'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

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