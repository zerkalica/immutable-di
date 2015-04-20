"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = getReactConnector;

function getReactConnector(React) {
    var ComponentWrapper = (function (_React$Component) {
        function ComponentWrapper(_ref) {
            var state = _ref.state;
            var dispatcher = _ref.dispatcher;
            var getter = _ref.getter;
            var component = _ref.component;
            var context = _ref.context;

            _classCallCheck(this, ComponentWrapper);

            _get(Object.getPrototypeOf(ComponentWrapper.prototype), "constructor", this).call(this, state);
            this.state = state;
            this._dispatcher = dispatcher;
            this._getter = getter;
            this._component = component;
            this._context = context;
        }

        _inherits(ComponentWrapper, _React$Component);

        _createClass(ComponentWrapper, [{
            key: "getChildContext",
            value: function getChildContext() {
                return this._context;
            }
        }, {
            key: "componentDidMount",
            value: function componentDidMount() {
                var _this = this;

                this._listener = this._dispatcher.mount(this._getter, function (state) {
                    return _this.setState(state);
                });
            }
        }, {
            key: "componentWillUnmount",
            value: function componentWillUnmount() {
                this._dispatcher.unmount(this._listener);
            }
        }, {
            key: "render",
            value: function render() {
                return React.createElement(this._component, this.state);
            }
        }], [{
            key: "childContextTypes",
            value: {
                actions: React.PropTypes.object
            },
            enumerable: true
        }]);

        return ComponentWrapper;
    })(React.Component);

    return ComponentWrapper;
}

module.exports = exports["default"];