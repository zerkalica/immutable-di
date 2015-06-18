'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = statefull;

var _container = require('../container');

var _container2 = _interopRequireDefault(_container);

var _dispatcher = require('../dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var StatefullComponent = (function (_Component) {
    function StatefullComponent(props, context) {
        _classCallCheck(this, StatefullComponent);

        _get(Object.getPrototypeOf(StatefullComponent.prototype), 'constructor', this).call(this, props, context);
        this.state = props;
        this.__listener = null;
    }

    _inherits(StatefullComponent, _Component);

    _createClass(StatefullComponent, [{
        key: 'getChildContext',
        value: function getChildContext() {
            return {
                container: this.props.container
            };
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            this.__listener = this.props.container.get(_dispatcher2['default']).mount(this.constructor.stateMap, function (state) {
                return _this.setState(state);
            }, this.constructor.displayName);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.container.get(_dispatcher2['default']).unmount(this.__listener);
        }
    }], [{
        key: 'propTypes',
        value: {
            container: _react.PropTypes.instanceOf(_container2['default']).isRequired
        },
        enumerable: true
    }, {
        key: 'childContextTypes',
        value: {
            container: _react.PropTypes.instanceOf(_container2['default']).isRequired
        },
        enumerable: true
    }, {
        key: 'stateMap',
        value: {},
        enumerable: true
    }]);

    return StatefullComponent;
})(_react.Component);

exports.StatefullComponent = StatefullComponent;

function statefull() {
    var stateMap = arguments[0] === undefined ? {} : arguments[0];

    return function wrapComponent(BaseComponent) {
        function _ref() {
            return (0, _react.createElement)(BaseComponent, this.state);
        }

        return (function (_StatefullComponent) {
            function ComponentWrapper() {
                _classCallCheck(this, ComponentWrapper);

                if (_StatefullComponent != null) {
                    _StatefullComponent.apply(this, arguments);
                }
            }

            _inherits(ComponentWrapper, _StatefullComponent);

            _createClass(ComponentWrapper, [{
                key: 'render',
                value: _ref
            }], [{
                key: 'stateMap',
                value: stateMap,
                enumerable: true
            }]);

            return ComponentWrapper;
        })(StatefullComponent);
    };
}