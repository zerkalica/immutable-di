'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _NativeAdapter = require('../native-adapter');

var _NativeAdapter2 = _interopRequireWildcard(_NativeAdapter);

var _describe$it$expect = require('../../test-helper');

_describe$it$expect.describe('state-adapters/native-adapter', function () {
    var testState = undefined;

    beforeEach(function () {
        testState = {
            a: {
                b: {
                    name: 'test-name'
                }
            }
        };
    });

    _describe$it$expect.it('should get part of object by path', function () {
        var nativeAdapter = new _NativeAdapter2['default'](testState);
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b);
    });

    _describe$it$expect.it('should throw error, if data in path not exists', function () {
        var nativeAdapter = new _NativeAdapter2['default'](testState);
        (function () {
            return nativeAdapter.getIn(['a', 'c', 'b']);
        }).should['throw']();
        _describe$it$expect.expect(nativeAdapter.getIn(['a', 'c'])).to.be.undefined;
    });

    _describe$it$expect.it('should transformState', function () {
        var mutation = { id: 'a', data: { c: 'test' } };
        var nativeAdapter = new _NativeAdapter2['default'](testState);
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b);
        nativeAdapter.transformState([mutation]);
        nativeAdapter.getIn(['a', 'c']).should.to.equal('test');
    });
});