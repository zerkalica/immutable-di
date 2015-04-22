'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;
exports['default'] = getReactConnector;

var _Dispatcher = require('../dispatcher');

var _Dispatcher2 = _interopRequireWildcard(_Dispatcher);

function getReactConnector(React, childContextTypes) {
    var p = React.PropTypes;

    var ComponentWrapper = (function (_React$Component) {
        function ComponentWrapper(props, context) {
            _classCallCheck(this, ComponentWrapper);

            _React$Component.call(this, props, context);
            this.state = props.state;
            this.__listener = null;
        }

        _inherits(ComponentWrapper, _React$Component);

        ComponentWrapper.prototype.getChildContext = function getChildContext() {
            return {
                actions: this.props.actions
            };
        };

        ComponentWrapper.prototype.componentDidMount = function componentDidMount() {
            var _this = this;

            this.__listener = this.props.dispatcher.mount(this.props.getter, function (state) {
                return _this.setState(state);
            });
        };

        ComponentWrapper.prototype.componentWillUnmount = function componentWillUnmount() {
            this.props.dispatcher.unmount(this.__listener);
        };

        ComponentWrapper.prototype.render = function render() {
            return React.createElement(this.props.component, this.state);
        };

        _createClass(ComponentWrapper, null, [{
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