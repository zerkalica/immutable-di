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
        render: {
            value: function render(Widget) {
                var _this = this;

                return this._container.get(Widget.__diGetter).then(function (options) {
                    return _this._renderer.render(_this._renderer.getElement(Widget, options));
                });
            },
            writable: true,
            configurable: true
        }
    });

    return Renderer;
})();

module.exports = Renderer;