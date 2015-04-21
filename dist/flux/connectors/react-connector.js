'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = getReactConnector;

var _Dispatcher = require('../dispatcher');

var _Dispatcher2 = _interopRequireWildcard(_Dispatcher);

function getReactConnector(React, childContextTypes) {
    var p = React.PropTypes;

    var ComponentWrapper = (function (_React$Component) {
        function ComponentWrapper(props, context) {
            _classCallCheck(this, ComponentWrapper);

            _get(Object.getPrototypeOf(ComponentWrapper.prototype), 'constructor', this).call(this, props, context);
            this.__listener = null;
            this.state = props.state;
        }

        _inherits(ComponentWrapper, _React$Component);

        _createClass(ComponentWrapper, [{
            key: '__listener',
            value: undefined,
            enumerable: true
        }, {
            key: 'getChildContext',
            value: function getChildContext() {
                return {
                    actions: this.props.actions
                };
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this = this;

                this.__listener = this.props.dispatcher.mount(this.props.getter, function (state) {
                    return _this.setState(state);
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.props.dispatcher.unmount(this.__listener);
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(this.props.component, this.props.state);
            }
        }], [{
            key: 'childContextTypes',
            value: {
                actions: p.object.isRequired
            },
            enumerable: true
        }, {
            key: 'propTypes',
            value: {
                dispatcher: p.instanceOf(_Dispatcher2['default']).isRequired,
                state: p.object.isRequired,
                getter: p.func.isRequired,
                component: p.func.isRequired,
                actions: p.object.isRequired
            },
            enumerable: true
        }]);

        return ComponentWrapper;
    })(React.Component);

    return ComponentWrapper;
}

module.exports = exports['default'];