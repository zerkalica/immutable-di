'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _powerAssert = require('power-assert');

var _powerAssert2 = _interopRequireDefault(_powerAssert);

var _container = require('../container');

var _container2 = _interopRequireDefault(_container);

var _cursorsNative = require('../cursors/native');

var _cursorsNative2 = _interopRequireDefault(_cursorsNative);

var _define = require('../define');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

describe('container', function () {
    var container = undefined;
    var initialState = {
        todo: {
            id: 0,
            todos: []
        }
    };

    beforeEach(function () {
        container = new _container2['default'](new _cursorsNative2['default']({ todo: _extends({}, initialState.todo) }));
    });

    describe('basics', function () {
        it('should throws exception if incorrect data passed to constructor', function () {
            _powerAssert2['default'].throws(function () {
                return new _container2['default']();
            }, /undefined/);
        });
    });

    describe('get', function () {
        it('should throws exception if no arguments passed', function () {
            _powerAssert2['default'].throws(function () {
                return container.get();
            });
        });

        it('should throws exception if no decorated function passed', function () {
            function WrongDep() {}

            _powerAssert2['default'].throws(function () {
                return container.get(WrongDep);
            });
        });

        it('should return class instance', function () {
            var Test = (function () {
                function Test() {
                    _classCallCheck(this, _Test);
                }

                var _Test = Test;
                Test = (0, _define.Class)()(Test) || Test;
                return Test;
            })();

            var instance = container.get(Test);

            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(instance, 'arguments/0/left') instanceof _powerAssert2['default']._capt(Test, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert(instance instanceof Test)',
                filepath: 'src/__tests__/container-test.js',
                line: 47
            }));
        });

        it('should cache class instance', function () {
            var TestBase = (function () {
                function TestBase() {
                    _classCallCheck(this, _TestBase);
                }

                var _TestBase = TestBase;
                TestBase = (0, _define.Class)()(TestBase) || TestBase;
                return TestBase;
            })();

            var Test = _sinon2['default'].spy(TestBase);

            var instance1 = container.get(Test);
            var instance2 = container.get(Test);

            _powerAssert2['default'].strictEqual(_powerAssert2['default']._expr(_powerAssert2['default']._capt(instance1, 'arguments/0'), {
                content: 'assert.strictEqual(instance1, instance2)',
                filepath: 'src/__tests__/container-test.js',
                line: 61
            }), _powerAssert2['default']._expr(_powerAssert2['default']._capt(instance2, 'arguments/1'), {
                content: 'assert.strictEqual(instance1, instance2)',
                filepath: 'src/__tests__/container-test.js',
                line: 61
            }));
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(Test, 'arguments/0/object').calledOnce, 'arguments/0'), {
                content: 'assert(Test.calledOnce)',
                filepath: 'src/__tests__/container-test.js',
                line: 62
            }));
        });

        it('should cache factory return value', function () {
            var MyDep = (0, _define.Factory)()(function _MyDep() {
                return 123;
            });

            var instance1 = container.get(MyDep);
            _powerAssert2['default'].strictEqual(_powerAssert2['default']._expr(_powerAssert2['default']._capt(instance1, 'arguments/0'), {
                content: 'assert.strictEqual(instance1, 123)',
                filepath: 'src/__tests__/container-test.js',
                line: 71
            }), 123);
        });

        it('should handle simple deps from array definition', function () {
            var MyDep = (0, _define.Factory)()(function _MyDep() {
                return 123;
            });

            var Test = (function () {
                function Test() {
                    _classCallCheck(this, _Test2);
                }

                var _Test2 = Test;
                Test = (0, _define.Class)([MyDep])(Test) || Test;
                return Test;
            })();

            var TestFake = _sinon2['default'].spy(Test);
            container.get(TestFake);
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(TestFake, 'arguments/0/callee/object').calledWith(123), 'arguments/0'), {
                content: 'assert(TestFake.calledWith(123))',
                filepath: 'src/__tests__/container-test.js',
                line: 84
            }));
        });

        it('should handle simple deps from object definition', function () {
            var MyDep = (0, _define.Factory)()(function _MyDep() {
                return 123;
            });

            var Test = (function () {
                function Test() {
                    _classCallCheck(this, _Test3);
                }

                var _Test3 = Test;
                Test = (0, _define.Class)({ fac: MyDep })(Test) || Test;
                return Test;
            })();

            var TestFake = _sinon2['default'].spy(Test);
            container.get(TestFake);
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(TestFake, 'arguments/0/callee/object').calledWith(_powerAssert2['default']._capt({ fac: 123 }, 'arguments/0/arguments/0')), 'arguments/0'), {
                content: 'assert(TestFake.calledWith({ fac: 123 }))',
                filepath: 'src/__tests__/container-test.js',
                line: 97
            }));
        });

        it('should handle state changes', function () {
            var MyDep = (0, _define.Factory)([['todo', 'id']])(function _MyDep(id) {
                return id;
            });

            var Test = (function () {
                function Test() {
                    _classCallCheck(this, _Test4);
                }

                var _Test4 = Test;
                Test = (0, _define.Class)([MyDep])(Test) || Test;
                return Test;
            })();

            var TestFake = _sinon2['default'].spy(Test);
            container.get(TestFake);
            container.select(['todo']).set('id', 321).commit();
            container.get(TestFake);
            container.get(TestFake);
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(TestFake, 'arguments/0/object').calledTwice, 'arguments/0'), {
                content: 'assert(TestFake.calledTwice)',
                filepath: 'src/__tests__/container-test.js',
                line: 114
            }));
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(TestFake, 'arguments/0/callee/object/object').firstCall, 'arguments/0/callee/object').calledWith(0), 'arguments/0'), {
                content: 'assert(TestFake.firstCall.calledWith(0))',
                filepath: 'src/__tests__/container-test.js',
                line: 115
            }));
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(TestFake, 'arguments/0/callee/object/object').secondCall, 'arguments/0/callee/object').calledWith(321), 'arguments/0'), {
                content: 'assert(TestFake.secondCall.calledWith(321))',
                filepath: 'src/__tests__/container-test.js',
                line: 116
            }));
        });
    });

    describe('selection', function () {
        it('should update state on next timer tick', function (done) {
            var MyDep = _sinon2['default'].spy((0, _define.Factory)([['todo', 'id']])(function _MyDep(id) {
                return id;
            }));

            container.get(MyDep);
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(container, 'arguments/0/left/callee/object').get(_powerAssert2['default']._capt(MyDep, 'arguments/0/left/arguments/0')), 'arguments/0/left') === 0, 'arguments/0'), {
                content: 'assert(container.get(MyDep) === 0)',
                filepath: 'src/__tests__/container-test.js',
                line: 129
            }));
            container.select(['todo']).set('id', 321);
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(container, 'arguments/0/left/callee/object').get(_powerAssert2['default']._capt(MyDep, 'arguments/0/left/arguments/0')), 'arguments/0/left') === 0, 'arguments/0'), {
                content: 'assert(container.get(MyDep) === 0)',
                filepath: 'src/__tests__/container-test.js',
                line: 131
            }));
            setTimeout(function () {
                (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(container, 'arguments/0/left/callee/object').get(_powerAssert2['default']._capt(MyDep, 'arguments/0/left/arguments/0')), 'arguments/0/left') === 321, 'arguments/0'), {
                    content: 'assert(container.get(MyDep) === 321)',
                    filepath: 'src/__tests__/container-test.js',
                    line: 133
                }));
                (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/object').calledTwice, 'arguments/0'), {
                    content: 'assert(MyDep.calledTwice)',
                    filepath: 'src/__tests__/container-test.js',
                    line: 134
                }));
                (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/callee/object/object').secondCall, 'arguments/0/callee/object').calledWith(321), 'arguments/0'), {
                    content: 'assert(MyDep.secondCall.calledWith(321))',
                    filepath: 'src/__tests__/container-test.js',
                    line: 135
                }));
                done();
            }, 1);
        });
    });

    describe('events', function () {
        it('should update mounted listener', function (done) {
            var MyDep = _sinon2['default'].spy((0, _define.Factory)([['todo', 'id']])(function _MyDep(id) {
                (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(id, 'arguments/0/left') === 321, 'arguments/0'), {
                    content: 'assert(id === 321)',
                    filepath: 'src/__tests__/container-test.js',
                    line: 146
                }));
                done();
                return id;
            }));

            container.mount(MyDep);
            container.select(['todo']).set('id', 321);
        });

        it('should not update listener with another path', function () {
            var MyDep = _sinon2['default'].spy((0, _define.Factory)([['todo', 'id']])(function _MyDep(id) {
                return id;
            }));

            container.mount(MyDep);
            container.select(['todo']).set('id2', 321).commit();
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/object').notCalled, 'arguments/0'), {
                content: 'assert(MyDep.notCalled)',
                filepath: 'src/__tests__/container-test.js',
                line: 164
            }));
        });

        it('should update listener once', function () {
            var MyDep = _sinon2['default'].spy();

            container.once([['todo', 'id']], MyDep);
            container.select(['todo']).set('id', 321).commit();
            container.select(['todo']).set('id', 432).commit();
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/object').calledOnce, 'arguments/0'), {
                content: 'assert(MyDep.calledOnce)',
                filepath: 'src/__tests__/container-test.js',
                line: 173
            }));
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/callee/object').calledWith(321), 'arguments/0'), {
                content: 'assert(MyDep.calledWith(321))',
                filepath: 'src/__tests__/container-test.js',
                line: 174
            }));
        });

        it('should not update unmounted listener', function () {
            var MyDep = _sinon2['default'].spy((0, _define.Factory)([['todo', 'id']])(function _MyDep(id) {
                (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(id, 'arguments/0/left') === 321, 'arguments/0'), {
                    content: 'assert(id === 321)',
                    filepath: 'src/__tests__/container-test.js',
                    line: 181
                }));
                done();
                return id;
            }));

            container.mount(MyDep);
            container.unmount(MyDep);
            container.select(['todo']).set('id', 321).commit();
            (0, _powerAssert2['default'])(_powerAssert2['default']._expr(_powerAssert2['default']._capt(_powerAssert2['default']._capt(MyDep, 'arguments/0/object').notCalled, 'arguments/0'), {
                content: 'assert(MyDep.notCalled)',
                filepath: 'src/__tests__/container-test.js',
                line: 189
            }));
        });
    });
});
//# sourceMappingURL=container-test.js.map