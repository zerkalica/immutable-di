'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _describe$it$spy$sinon$getClass = require('../../test-helper');

var _Factory$Class$Promises$WaitFor = require('../../define');

var _Dispatcher = require('../dispatcher');

var _Dispatcher2 = _interopRequireWildcard(_Dispatcher);

_describe$it$spy$sinon$getClass.describe('flux/dispatcher', function () {
    var dispatcher = undefined;
    var container = undefined;

    var Store1 = undefined;
    var Store2 = undefined;
    var fakeStoreHandle = undefined;
    var fakeTransformState = undefined;
    var fakeCreateMethod = undefined;
    var fakeGet = undefined;

    var testAction = 'test';
    var testPayload = { test: 111 };

    beforeEach(function () {
        fakeStoreHandle = _describe$it$spy$sinon$getClass.spy();
        fakeTransformState = _describe$it$spy$sinon$getClass.spy();
        fakeCreateMethod = _describe$it$spy$sinon$getClass.spy();
        fakeGet = _describe$it$spy$sinon$getClass.spy();
        container = {
            transformState: fakeTransformState,
            get: function get(def) {
                fakeGet(def);
                return def();
            },
            createMethod: function createMethod() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                fakeCreateMethod.apply(undefined, args);
                return {
                    handle: function handle(store) {
                        fakeStoreHandle(store);
                        return { id: 'test', data: { test: 1 } };
                    }
                };
            }
        };
        dispatcher = new _Dispatcher2['default'](container);
        Store1 = _describe$it$spy$sinon$getClass.getClass(['handle']);
        _Factory$Class$Promises$WaitFor.Class(Store1);
        Store2 = _describe$it$spy$sinon$getClass.getClass(['handle']);
        _Factory$Class$Promises$WaitFor.Class(Store2);
        dispatcher.setStores([Store1, Store2]);
    });

    _describe$it$spy$sinon$getClass.describe('dispatch', function () {
        _describe$it$spy$sinon$getClass.it('should create invoker instance if action dispatched', function () {
            return dispatcher.dispatch(testAction, testPayload).then(function () {
                fakeCreateMethod.should.have.been.calledOnce.and.calledWith(testAction, testPayload);
            });
        });

        _describe$it$spy$sinon$getClass.it('should pass stores to handle', function () {
            return dispatcher.dispatch(testAction, testPayload).then(function () {
                fakeStoreHandle.should.have.been.calledTwice;
                fakeStoreHandle.firstCall.should.calledWith(Store1);
                fakeStoreHandle.secondCall.should.calledWith(Store2);
            });
        });
    });

    _describe$it$spy$sinon$getClass.describe('mount', function () {
        _describe$it$spy$sinon$getClass.it('should return listener definition', function () {
            var listener = _describe$it$spy$sinon$getClass.spy();
            var DefFn = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises$WaitFor.Factory(DefFn);
            dispatcher.mount(DefFn, listener).should.to.be.a('function');
        });

        _describe$it$spy$sinon$getClass.it('should call get if mount listener', function () {
            var listener = _describe$it$spy$sinon$getClass.spy();
            var DefFn = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises$WaitFor.Factory(DefFn);
            var listenerDef = dispatcher.mount(DefFn, listener);

            return dispatcher.dispatch(testAction, testPayload).then(function () {
                fakeGet.should.have.been.calledWith(listenerDef);
            });
        });

        _describe$it$spy$sinon$getClass.it('should not call get if unmount listener', function () {
            var listener = _describe$it$spy$sinon$getClass.spy();
            var DefFn = _describe$it$spy$sinon$getClass.spy();
            _Factory$Class$Promises$WaitFor.Factory(DefFn);
            var listenerDef = dispatcher.mount(DefFn, listener);
            dispatcher.unmount(listenerDef);

            return dispatcher.dispatch(testAction, testPayload).then(function () {
                fakeGet.should.not.have.been.called;
            });
        });
    });
});