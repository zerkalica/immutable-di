'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

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