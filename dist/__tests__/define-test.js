'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _getDef$Class$Factory = require('../define');

var _describe$it$spy = require('../test-helper');

_describe$it$spy.describe('define', function () {
    _describe$it$spy.it('getDef should return .__di property', function () {
        var TestSrv = function TestSrv() {
            _classCallCheck(this, TestSrv);
        };

        TestSrv.__di = 'test';

        _getDef$Class$Factory.getDef(TestSrv).should.to.be.equal('test');
    });

    _describe$it$spy.it('Class should define class service', function () {
        var T1 = function T1() {
            _classCallCheck(this, T1);
        };

        _getDef$Class$Factory.Class(T1);
        T1.__di.should.to.be.include.keys(['id', 'isClass', 'scope', 'deps']);
    });

    _describe$it$spy.it('Factory should define class service', function () {
        function F1() {}
        _getDef$Class$Factory.Factory(F1);
        F1.__di.should.to.be.include.keys(['id', 'isClass', 'scope', 'deps']);
    });

    _describe$it$spy.it('should handle deps with promises', function () {
        function depFn() {
            return new _Promise(function (resolve) {
                return resolve('depFn.value');
            });
        }
        _getDef$Class$Factory.Factory(depFn);

        var DepClass = (function () {
            function DepClass() {
                _classCallCheck(this, DepClass);
            }

            _createClass(DepClass, [{
                key: 'test',
                value: function test() {
                    return 'DepClass.value';
                }
            }]);

            return DepClass;
        })();

        _getDef$Class$Factory.Class(DepClass, ['state.a.b']);

        function testObjectDeps(_ref) {
            var depClass = _ref.depClass;
            var depFnValue = _ref.depFnValue;

            if (!(depClass instanceof DepClass)) {
                throw new Error('arg is not an instance of DepClass');
            }
            return 'testFunc.value.' + depClass.test() + '.' + depFnValue;
        }

        function ph(p) {
            return p['catch'](function (err) {
                return err;
            });
        }

        _getDef$Class$Factory.Factory(testObjectDeps, {
            depFnValue: depFn,
            depClass: [DepClass, ph]
        });

        var def = testObjectDeps.__di;

        def.id.should.be.match(/^testObjectDeps.*/);
        def.scope.should.be.equal('state');
        def.deps.should.be.a('array').and.to.have.length(2);
        def.should.have.deep.property('deps.0.name', 'depFnValue');
        def.should.have.deep.property('deps.0.promiseHandler', null);
        def.should.have.deep.property('deps.0.path', null);
        def.should.have.deep.property('deps.0.definition', depFn);

        def.should.have.deep.property('deps.1.name', 'depClass');
        def.should.have.deep.property('deps.1.promiseHandler', ph);
        def.should.have.deep.property('deps.1.path', null);
        def.should.have.deep.property('deps.1.definition', DepClass);
    });
});