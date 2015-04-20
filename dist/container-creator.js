'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _Container = require('./container');

var _Container2 = _interopRequireWildcard(_Container);

var ContainerCreator = (function () {
    function ContainerCreator(StateAdapter) {
        _classCallCheck(this, ContainerCreator);

        this._StateAdapter = StateAdapter;
        this._globalCache = new Map();
    }

    _createClass(ContainerCreator, [{
        key: 'create',
        value: function create(state) {
            return new _Container2['default']({
                state: new this._StateAdapter(state),
                globalCache: this._globalCache
            });
        }
    }]);

    return ContainerCreator;
})();

exports['default'] = ContainerCreator;
module.exports = exports['default'];