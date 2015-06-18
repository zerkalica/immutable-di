'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var AbstractStateAdapter = (function () {
    function AbstractStateAdapter() {
        _classCallCheck(this, AbstractStateAdapter);
    }

    _createClass(AbstractStateAdapter, [{
        key: 'get',
        value: function get(path) {
            throw new Error('implement');
        }
    }, {
        key: 'set',
        value: function set(path, newState) {
            throw new Error('implement');
        }
    }]);

    return AbstractStateAdapter;
})();

exports['default'] = AbstractStateAdapter;