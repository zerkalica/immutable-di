'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _ContainerCreator = require('../container-creator');

var _ContainerCreator2 = _interopRequireWildcard(_ContainerCreator);

var _NativeAdapter = require('../state-adapters/native-adapter');

var _NativeAdapter2 = _interopRequireWildcard(_NativeAdapter);

var _describe$it$spy$sinon$getClass = require('../test-helper');

var _Factory$Class$Promises = require('../define');

_describe$it$spy$sinon$getClass.describe('container', function () {
    var state = {
        state: { a: { b: 1, b1: 2 } },
        p: {
            a: 'test-state-val'
        }
    };
    var creator = undefined;
    var container = undefined;

    function depFn() {
        return new Promise(function (resolve) {
            return resolve('depFn.value');
        });
    }
    _Factory$Class$Promises.Factory(depFn);

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

    _Factory$Class$Promises.Class(DepClass, ['state.a.b']);

    function testFunc(depClass, depFnValue) {
        if (!(depClass instanceof DepClass)) {
            throw new Error('arg is not an instance of DepClass');
        }
        return 'testFunc.value.' + depClass.test() + '.' + depFnValue;
    }
    _Factory$Class$Promises.Factory(testFunc, [DepClass, [depFn, _Factory$Class$Promises.Promises.ignore]]);

    function testObjectDeps(_ref) {
        var depClass = _ref.depClass;
        var depFnValue = _ref.depFnValue;

        if (!(depClass instanceof DepClass)) {
            throw new Error('arg is not an instance of DepClass');
        }
        return 'testFunc.value.' + depClass.test() + '.' + depFnValue;
    }
    _Factory$Class$Promises.Factory(testObjectDeps, {
        depFnValue: depFn,
        depClass: DepClass
    });

    beforeEach(function () {
        creator = new _ContainerCreator2['default'](_NativeAdapter2['default']);
        container = creator.create(state);
    });

    _describe$it$spy$sinon$getClass.describe('if wrong arguments passed', function () {
        _describe$it$spy$sinon$getClass.it('should throw exception if no argument passed', function () {
            var msg = 'Getter is not a definition in unk';
            (function () {
                return container.get();
            }).should['throw'](msg);
        });

        _describe$it$spy$sinon$getClass.it('should throw exception if null argument passed', function () {
            var msg = 'Getter is not a definition in unk';
            (function () {
                return container.get(null);
            }).should['throw'](msg);
            (function () {
                return container.get('');
            }).should['throw'](msg);
            (function () {
                return container.get(0);
            }).should['throw'](msg);
            (function () {
                return container.get(false);
            }).should['throw'](msg);
        });

        _describe$it$spy$sinon$getClass.it('should throw exception if not service prototype passed', function () {
            function TestService() {}
            (function () {
                return container.get(TestService);
            }).should['throw']();
        });

        _describe$it$spy$sinon$getClass.it('should throw exception if no service name defined', function () {
            function TestService() {
                return 123;
            }
            (function () {
                return container.get(TestService);
            }).should['throw']('Property .__id not exist in unk');
        });
    });

    _describe$it$spy$sinon$getClass.describe('if correct service prototype passed', function () {
        _describe$it$spy$sinon$getClass.it('should instance simple service as promise', function () {
            function TestService() {
                return 1234;
            }
            _Factory$Class$Promises.Factory(TestService);
            container.get(TestService).should.instanceOf(Promise);
        });

        _describe$it$spy$sinon$getClass.it('should resolve deps for simple class', function () {
            function testFactory() {
                return new Promise(function (resolve) {
                    return resolve('testFactory.value');
                });
            }
            _Factory$Class$Promises.Factory(testFactory);

            var TestClass = (function () {
                function TestClass(testFactoryValue) {
                    _classCallCheck(this, TestClass);

                    this.tfv = testFactoryValue;
                }

                _createClass(TestClass, [{
                    key: 'get',
                    value: function get() {
                        return 'TestClass.' + this.tfv;
                    }
                }]);

                return TestClass;
            })();

            _Factory$Class$Promises.Class(TestClass, [testFactory]);
            var v = container.get(TestClass).then(function (testClass) {
                return testClass.get();
            });

            return v.should.eventually.to.equal('TestClass.testFactory.value');
        });

        _describe$it$spy$sinon$getClass.it('should instance complex service with deps and return value', function () {
            return container.get(testFunc).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value');
        });

        _describe$it$spy$sinon$getClass.it('should instance complex service with deps as object and return value', function () {
            return container.get(testObjectDeps).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value');
        });

        _describe$it$spy$sinon$getClass.it('should resolve state path as dep', function () {
            var exampleValue = 'test-va';

            function Dep(pa) {
                return exampleValue + '.' + pa;
            }
            _Factory$Class$Promises.Factory(Dep, ['p.a']);

            return container.get(Dep).should.eventually.equal(exampleValue + '.' + state.p.a);
        });

        _describe$it$spy$sinon$getClass.it('should throw error, if path not found in state', function () {
            var exampleValue = 'test-va';

            function Dep(pa) {
                return exampleValue + '.' + pa;
            }
            _Factory$Class$Promises.Factory(Dep, 'f.a');
            return (function () {
                return container.get(Dep);
            }).should['throw']();
        });

        _describe$it$spy$sinon$getClass.it('should instance simple service and put it in global cache', function () {
            var exampleValue = 'test';
            function TestService2() {
                return new Promise(function (resolve) {
                    return resolve(exampleValue);
                });
            }
            _Factory$Class$Promises.Factory(TestService2);
            container.get(TestService2);
            var globalCache = creator._globalCache;

            return globalCache.get(TestService2.__di.id).should.eventually.equal(exampleValue);
        });

        _describe$it$spy$sinon$getClass.it('should instance simple service and put it in state cache', function () {
            var exampleValue = 'test-va';

            function Dep(pa) {
                return exampleValue + '.' + pa;
            }
            _Factory$Class$Promises.Factory(Dep, ['p.a']);

            container.get(Dep);

            var localCache = container._cache.get('p');
            localCache.should.to.be.instanceOf(Map);

            return localCache.get(Dep.__di.id).should.eventually.equal(exampleValue + '.' + state.p.a);
        });

        _describe$it$spy$sinon$getClass.it('should use cache, if called twice or more', function () {
            var Dep = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises.Factory(Dep, ['p.a']);

            return container.get(Dep).then(function (d) {
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledOnce;
            });
        });

        _describe$it$spy$sinon$getClass.it('should compute state-depended value again after clear cache', function () {
            var Dep = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises.Factory(Dep, ['p.a']);

            return container.get(Dep).then(function (d) {
                container.clear('p');
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledTwice;
            });
        });

        _describe$it$spy$sinon$getClass.it('should compute global-depended value again after clear cache', function () {
            var Dep = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises.Factory(Dep);

            return container.get(Dep).then(function (d) {
                container.clear('global');
                return container.get(Dep);
            }).then(function (d) {
                Dep.should.have.been.calledTwice;
            });
        });

        _describe$it$spy$sinon$getClass.it('should transform state', function () {
            var depFn = _describe$it$spy$sinon$getClass.spy();
            var Dep = function Dep(state) {
                depFn();
                return state;
            };
            _Factory$Class$Promises.Factory(Dep, ['state']);

            return container.get(Dep).then(function (data) {
                data.should.be.deep.equal({ a: { b: 1, b1: 2 } });

                container.transformState(function (_ref2) {
                    var get = _ref2.get;
                    var set = _ref2.set;

                    set('state', { a: { b: 2 } });

                    return ['state'];
                });
                return container.get(Dep);
            }).then(function (data) {
                container.get(Dep);
                depFn.should.be.calledTwice;
                return data;
            }).then(function (data) {
                data.should.deep.equal({ a: { b: 2 } });
            });
        });
    });

    _describe$it$spy$sinon$getClass.describe('exception handling', function () {
        _describe$it$spy$sinon$getClass.it('should return empty data, if service throws exception', function () {
            var exampleValue = 'test-va';
            var testFallback = {
                test: '123'
            };
            function Dep(context) {
                throw new Error('test');
                return exampleValue;
            }
            _Factory$Class$Promises.Factory(Dep, ['p.a']);

            function TestService(dep) {
                return new Promise.resolve(dep);
            }
            _Factory$Class$Promises.Factory(TestService, [[Dep, function (p) {
                return p['catch'](function (err) {
                    return testFallback;
                });
            }]]);

            container.get(TestService).should.eventually.deep.equal(testFallback);
        });

        _describe$it$spy$sinon$getClass.it('should filter exception, if service throws custom exception', function () {
            var testErr = { test: 123 };
            function Dep() {
                throw new ReferenceError('test');
            }
            _Factory$Class$Promises.Factory(Dep);

            function TestService(dep) {
                return new Promise.resolve(dep);
            }
            _Factory$Class$Promises.Factory(TestService, [[Dep, function (p) {
                return p['catch'](ReferenceError, function (err) {
                    return testErr;
                });
            }]]);

            container.get(TestService).should.eventually.deep.equal(testErr);
        });
    });
});