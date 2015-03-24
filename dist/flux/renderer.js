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
        _widgetToDefinition: {
            value: function _widgetToDefinition(name, Widget) {
                var _this = this;

                var factory = this._container.factory;
                return factory(name + "__Element", factory(name, {
                    props: factory(name + "__Props", Widget.__props),
                    state: factory(name + "__State", Widget.__state, Widget.__transducer)
                }), function (_ref) {
                    var props = _ref.props;
                    return _this._renderer.getElement(Widget, props);
                });
            },
            writable: true,
            configurable: true
        },
        render: {
            value: function render(Widget) {
                var _this = this;

                return this._container.get(this._widgetToDefinition(this._renderer.getName(Widget), Widget)).then(function (el) {
                    return _this._renderer.render(el);
                });
            },
            writable: true,
            configurable: true
        }
    });

    return Renderer;
})();

module.exports = Renderer;