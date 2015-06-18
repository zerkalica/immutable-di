'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = Widget;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function Widget(renderMethod) {
    function _ref() {
        return renderMethod.call(this, this.props, this.context);
    }

    return (function (_Component) {
        function ComponentWrapper() {
            _classCallCheck(this, ComponentWrapper);

            if (_Component != null) {
                _Component.apply(this, arguments);
            }
        }

        _inherits(ComponentWrapper, _Component);

        _createClass(ComponentWrapper, [{
            key: 'render',
            value: _ref
        }]);

        return ComponentWrapper;
    })(_react.Component);
}

module.exports = exports['default'];