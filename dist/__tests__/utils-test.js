'use strict';

var _getDebugPath$getFunctionName = require('../utils');

var _describe$it$expect = require('../test-helper');

_describe$it$expect.describe('utils', function () {
    _describe$it$expect.describe('getDebugPath', function () {
        _describe$it$expect.it('should return string', function () {
            _getDebugPath$getFunctionName.getDebugPath().should.to.be.equal('unk');
            _getDebugPath$getFunctionName.getDebugPath('').should.to.be.equal('unk');
            _getDebugPath$getFunctionName.getDebugPath([]).should.to.be.equal('unk');
        });

        _describe$it$expect.it('should return valid path, if only first argument supplied', function () {
            _getDebugPath$getFunctionName.getDebugPath(['test']).should.to.be.equal('test.unk');
        });
        _describe$it$expect.it('should return valid path', function () {
            _getDebugPath$getFunctionName.getDebugPath(['test', 'q']).should.to.be.equal('test.q');
        });
    });

    _describe$it$expect.describe('getFunctionName', function () {
        _describe$it$expect.it('should return function name as string', function () {
            function test( /* test */arg1, arg2 /** test2 **/) {
                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    args[_key - 2] = arguments[_key];
                }
            }
            var fn = _getDebugPath$getFunctionName.getFunctionName(test);

            fn.should.to.equal('test');
        });
    });
});