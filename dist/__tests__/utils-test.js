'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _isPromise$getDebugPath$classToFactory$getFunctionName = require('../utils');

var _describe$it$expect = require('../test-helper');

_describe$it$expect.describe('utils', function () {
    _describe$it$expect.describe('classToFactory', function () {
        var TestC = function TestC() {
            _classCallCheck(this, TestC);
        };

        var TestC1 = function TestC1(a, b) {
            _classCallCheck(this, TestC1);

            if (a !== 1 || b !== 2) {
                throw new Error('Invalid arguments');
            }
            this.c = a + b;
        };

        _describe$it$expect.it('should create function from class', function () {
            _isPromise$getDebugPath$classToFactory$getFunctionName.classToFactory(TestC).should.to.be['function'];
        });

        _describe$it$expect.it('should create factory function, which returns instance of class', function () {
            _isPromise$getDebugPath$classToFactory$getFunctionName.classToFactory(TestC)().should.to.be.instanceOf(TestC);
        });

        _describe$it$expect.it('should call constructor of original class', function () {
            var factory = _isPromise$getDebugPath$classToFactory$getFunctionName.classToFactory(TestC1);
            (function () {
                return factory();
            }).should.to['throw']('Invalid arguments');
        });

        _describe$it$expect.it('should pass arguments to constructor', function () {
            var factory = _isPromise$getDebugPath$classToFactory$getFunctionName.classToFactory(TestC1);
            (function () {
                return factory(1, 2);
            }).should.not.to['throw']();
            _describe$it$expect.expect(factory(1, 2).c).equal(3);
        });
    });

    _describe$it$expect.describe('getDebugPath', function () {
        _describe$it$expect.it('should return string', function () {
            _isPromise$getDebugPath$classToFactory$getFunctionName.getDebugPath().should.to.be.equal('unk');
            _isPromise$getDebugPath$classToFactory$getFunctionName.getDebugPath('').should.to.be.equal('unk');
            _isPromise$getDebugPath$classToFactory$getFunctionName.getDebugPath([]).should.to.be.equal('unk');
        });

        _describe$it$expect.it('should return valid path, if only first argument supplied', function () {
            _isPromise$getDebugPath$classToFactory$getFunctionName.getDebugPath(['test']).should.to.be.equal('test.unk');
        });
        _describe$it$expect.it('should return valid path', function () {
            _isPromise$getDebugPath$classToFactory$getFunctionName.getDebugPath(['test', 'q']).should.to.be.equal('test.q');
        });
    });

    _describe$it$expect.describe('getFunctionName', function () {
        _describe$it$expect.it('should return function name as string', function () {
            function test( /* test */arg1, arg2 /** test2 **/) {
                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    args[_key - 2] = arguments[_key];
                }
            }
            var fn = _isPromise$getDebugPath$classToFactory$getFunctionName.getFunctionName(test);

            fn.should.to.equal('test');
        });
    });
});