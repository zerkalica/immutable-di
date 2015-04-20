'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _Invoker = require('../invoker');

var _Invoker2 = _interopRequireWildcard(_Invoker);

var _ContainerCreator = require('../container-creator');

var _ContainerCreator2 = _interopRequireWildcard(_ContainerCreator);

var _NativeAdapter = require('../state-adapters/native-adapter');

var _NativeAdapter2 = _interopRequireWildcard(_NativeAdapter);

var _Class$Factory$WaitFor = require('../define');

var _describe$it$spy$sinon = require('../test-helper');

_describe$it$spy$sinon.describe('invoker', function () {
    var state = {
        p: {
            a: 'test-state-val'
        }
    };
    var creator = undefined;
    var getInvoker = undefined;

    beforeEach(function () {
        creator = new _ContainerCreator2['default']();
        var container = creator.create(new _NativeAdapter2['default'](state));

        getInvoker = function (actionType, payload) {
            return new _Invoker2['default']({
                container: container,
                actionType: actionType,
                getPayload: function getPayload(id) {
                    return payload;
                }
            });
        };
    });

    _describe$it$spy$sinon.it('should handle simple store', function () {
        var fakeHandle = _describe$it$spy$sinon.spy();
        var testAction = 'testAction';
        var testPayload = { a: 1, b: 2 };

        var TestStore = (function () {
            function TestStore() {
                _classCallCheck(this, TestStore);
            }

            _createClass(TestStore, [{
                key: 'handle',
                value: function handle(actionType, payload) {
                    return Promise.resolve(fakeHandle(actionType, payload));
                }
            }]);

            return TestStore;
        })();

        _Class$Factory$WaitFor.Class(TestStore);
        _Class$Factory$WaitFor.WaitFor(TestStore);

        var invoker = getInvoker(testAction, testPayload);
        return invoker.handle(TestStore).then(function (d) {
            fakeHandle.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
        });
    });

    _describe$it$spy$sinon.it('should produce mutation with id and data', function () {
        var testAction = 'testAction';
        var testPayload = { a: 1, b: 2 };
        var id = 'TestStore';
        var data = 'testResult';

        var TestStore = (function () {
            function TestStore() {
                _classCallCheck(this, TestStore);
            }

            _createClass(TestStore, [{
                key: 'handle',
                value: function handle(actionType, payload) {
                    return Promise.resolve(data);
                }
            }]);

            return TestStore;
        })();

        _Class$Factory$WaitFor.Class(TestStore);
        _Class$Factory$WaitFor.WaitFor(TestStore);

        var invoker = getInvoker(testAction, testPayload);
        return invoker.handle(TestStore).then(function (d) {
            d.should.have.property('data', data);
            d.should.have.property('id');
            d.id.should.match(/TestStore.*/);
        });
    });

    _describe$it$spy$sinon.describe('deps and waitFor', function () {
        var fakeHandle = undefined;
        var fakeHandle1 = undefined;
        var fakeHandle2 = undefined;
        var testAction = 'testAction';
        var testPayload = { a: 1, b: 2 };
        var invoker = undefined;

        var TestDep1 = (function () {
            function TestDep1() {
                _classCallCheck(this, TestDep1);
            }

            _createClass(TestDep1, [{
                key: 'handle',
                value: function handle(actionType, payload) {
                    return Promise.resolve(fakeHandle1(actionType, payload));
                }
            }]);

            return TestDep1;
        })();

        _Class$Factory$WaitFor.Class(TestDep1);

        var TestDep2 = (function () {
            function TestDep2() {
                _classCallCheck(this, TestDep2);
            }

            _createClass(TestDep2, [{
                key: 'handle',
                value: function handle(actionType, payload) {
                    return Promise.resolve(fakeHandle2(actionType, payload));
                }
            }]);

            return TestDep2;
        })();

        _Class$Factory$WaitFor.Class(TestDep2);
        _Class$Factory$WaitFor.WaitFor(TestDep2, [TestDep1]);

        var TestStore = (function () {
            function TestStore() {
                _classCallCheck(this, TestStore);
            }

            _createClass(TestStore, [{
                key: 'handle',
                value: function handle(actionType, payload) {
                    return Promise.resolve(fakeHandle(actionType, payload));
                }
            }]);

            return TestStore;
        })();

        _Class$Factory$WaitFor.Class(TestStore);
        _Class$Factory$WaitFor.WaitFor(TestStore, [TestDep2, TestDep1]);

        beforeEach(function () {
            fakeHandle = _describe$it$spy$sinon.spy();
            fakeHandle1 = _describe$it$spy$sinon.spy();
            fakeHandle2 = _describe$it$spy$sinon.spy();
            invoker = getInvoker(testAction, testPayload);
        });

        _describe$it$spy$sinon.it('should cache handler calls', function () {
            return Promise.all([invoker.handle(TestDep2), invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1), invoker.handle(TestDep1)]).then(function (d) {
                fakeHandle1.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
                fakeHandle2.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
                fakeHandle.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
            });
        });

        _describe$it$spy$sinon.it('should call with order store handlers', function () {
            return Promise.all([invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1)]).then(function (d) {
                _describe$it$spy$sinon.sinon.assert.callOrder(fakeHandle1, fakeHandle2, fakeHandle);
            });
        });

        _describe$it$spy$sinon.it('should produce the mutation result of passed definition', function () {
            var testResult = ['mut1', 'mut2', 'mut'];
            fakeHandle = function () {
                return 'mut';
            };
            fakeHandle1 = function () {
                return 'mut1';
            };
            fakeHandle2 = function () {
                return 'mut2';
            };

            return Promise.all([invoker.handle(TestStore), invoker.handle(TestDep2), invoker.handle(TestDep1)]).then(function (d) {
                d[0].data.should.to.be.equal('mut');
                d[1].data.should.to.be.equal('mut2');
                d[2].data.should.to.be.equal('mut1');
            });
        });
    });
});