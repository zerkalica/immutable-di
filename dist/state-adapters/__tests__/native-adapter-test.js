'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _nativeAdapter = require('../native-adapter');

var _nativeAdapter2 = _interopRequireDefault(_nativeAdapter);

var _testHelper = require('../../test-helper');

function _ref(_ref2) {
    var get = _ref2.get;
    var set = _ref2.set;

    set(['a'], { c: 'test' });
}

(0, _testHelper.describe)('state-adapters/native-adapter', function () {
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

    (0, _testHelper.it)('should get part of object by path', function () {
        var nativeAdapter = new _nativeAdapter2['default'](testState);
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b);
    });

    (0, _testHelper.it)('should throw error, if data in path not exists', function () {
        var nativeAdapter = new _nativeAdapter2['default'](testState);
        (function () {
            return nativeAdapter.getIn(['a', 'c', 'b']);
        }).should['throw']();
        (0, _testHelper.expect)(nativeAdapter.getIn(['a', 'c'])).to.be.undefined;
    });

    (0, _testHelper.it)('should transformState', function () {
        var nativeAdapter = new _nativeAdapter2['default'](testState);
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b);
        nativeAdapter.transformState(_ref);
        nativeAdapter.getIn(['a', 'c']).should.to.equal('test');
    });
});