"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Container = _interopRequire(require("./container"));

var GenericAdapter = _interopRequire(require("./definition-adapters/generic-adapter"));

var ContainerCreator = (function () {
    function ContainerCreator() {
        _classCallCheck(this, ContainerCreator);

        this._globalCache = new Map();
    }

    _prototypeProperties(ContainerCreator, null, {
        create: {
            value: function create(state) {
                return new Container({
                    state: state,
                    globalCache: this._globalCache
                });
            },
            writable: true,
            configurable: true
        }
    });

    return ContainerCreator;
})();

module.exports = ContainerCreator;