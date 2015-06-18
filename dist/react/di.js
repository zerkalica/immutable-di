'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = di;

var _define = require('../define');

var _container = require('../container');

var _container2 = _interopRequireDefault(_container);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var DiComponent = (function (_Component) {
    function DiComponent() {
        _classCallCheck(this, DiComponent);

        if (_Component != null) {
            _Component.apply(this, arguments);
        }
    }

    _inherits(DiComponent, _Component);

    _createClass(DiComponent, null, [{
        key: 'contextTypes',
        value: {
            container: _react.PropTypes.instanceOf(_container2['default']).isRequired
        },
        enumerable: true
    }]);

    return DiComponent;
})(_react.Component);

exports.DiComponent = DiComponent;

function _ref(p) {
    return p;
}

function di(deps) {
    return function wrapComponent(BaseComponent) {
        var Getter = (0, _define.Factory)(deps, BaseComponent.displayName)(_ref);

        function _ref2() {
            var di = this.context.container.get(Getter);
            return (0, _react.createElement)(BaseComponent, _extends({}, this.props, di));
        }

        return (function (_DiComponent) {
            function ComponentWrapper() {
                _classCallCheck(this, ComponentWrapper);

                if (_DiComponent != null) {
                    _DiComponent.apply(this, arguments);
                }
            }

            _inherits(ComponentWrapper, _DiComponent);

            _createClass(ComponentWrapper, [{
                key: 'render',
                value: _ref2
            }]);

            return ComponentWrapper;
        })(DiComponent);
    };
}