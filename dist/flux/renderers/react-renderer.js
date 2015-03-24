"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ReactRenderer = (function () {
    function ReactRenderer(React, target) {
        _classCallCheck(this, ReactRenderer);

        this._React = React;
        this._target = target;
    }

    _prototypeProperties(ReactRenderer, null, {
        getElement: {
            value: function getElement(Widget, options) {
                return this._React.createElement(Widget, options);
            },
            writable: true,
            configurable: true
        },
        getName: {
            value: function getName(Widget) {
                return Widget.displayName;
            },
            writable: true,
            configurable: true
        },
        render: {
            value: function render(el) {
                var _this = this;

                return new Promise(function (resolve) {
                    return _this._target ? _this._React.render(el, _this._target, resolve) : resolve(_this._React.renderToString(el));
                });
            },
            writable: true,
            configurable: true
        }
    });

    return ReactRenderer;
})();

module.exports = ReactRenderer;