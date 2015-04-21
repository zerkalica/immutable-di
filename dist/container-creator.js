'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _Container = require('./container');

var _Container2 = _interopRequireWildcard(_Container);

var ContainerCreator = (function () {
    function ContainerCreator(StateAdapter) {
        _classCallCheck(this, ContainerCreator);

        this._StateAdapter = StateAdapter;
        this._globalCache = new _Map();
    }

    _createClass(ContainerCreator, [{
        key: 'create',
        value: function create(state) {
            return new _Container2['default']({
                state: new this._StateAdapter(state),
                globalCache: this._globalCache
            });
        }
    }]);

    return ContainerCreator;
})();

exports['default'] = ContainerCreator;
module.exports = exports['default'];