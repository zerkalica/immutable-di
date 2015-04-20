'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _ContainerCreator = require('../container-creator');

var _ContainerCreator2 = _interopRequireWildcard(_ContainerCreator);

var _NativeAdapter = require('../state-adapters/native-adapter');

var _NativeAdapter2 = _interopRequireWildcard(_NativeAdapter);

var _Container = require('../container');

var _Container2 = _interopRequireWildcard(_Container);

var _describe$it$spy$sinon$getClass = require('../test-helper');

_describe$it$spy$sinon$getClass.describe('container-creator', function () {
    _describe$it$spy$sinon$getClass.it('should create new container', function () {
        var creator = new _ContainerCreator2['default'](_NativeAdapter2['default']);
        creator.create().should.instanceOf(_Container2['default']);
    });
});