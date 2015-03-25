"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var bindAll = require("../utils").bindAll;

var Container = _interopRequire(require("../container"));

var Renderer = (function () {
    function Renderer(container) {
        _classCallCheck(this, Renderer);

        this._container = container;
        this._renderer = null;
        bindAll(this);
    }

    Renderer.__class = ["StateBinder", Container];

    _prototypeProperties(Renderer, null, {
        setAdapter: {
            value: function setAdapter(renderer) {
                this._renderer = renderer;
                return this;
            },
            writable: true,
            configurable: true
        },
        _createDefinition: {
            value: function _createDefinition(Widget) {
                var displayName = Widget.displayName;
                var props = Widget.props;
                var state = Widget.state;

                var name = displayName;
                var stateDef = factory(name + ".state", state);

                return factory(name + ".element", factory(name, {
                    updater: factory(name + ".updaterProvider", {}, function () {
                        return function (setState) {
                            return factory(name + ".updater", stateDef, function (state) {
                                return setState(state);
                            });
                        };
                    }),
                    props: factory(name + ".props", props),
                    state: stateDef
                }));
            },
            writable: true,
            configurable: true
        },
        render: {
            value: function render(Widget) {
                var _this = this;

                return this._container.get(this._createDefinition(Widget)).then(function (props) {
                    return _this._renderer.render(_this._renderer.getElement(Widget, props));
                });
            },
            writable: true,
            configurable: true
        }
    });

    return Renderer;
})();

module.exports = Renderer;