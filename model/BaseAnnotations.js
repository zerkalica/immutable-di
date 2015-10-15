'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var BaseAnnotations = (function () {
    function BaseAnnotations() {
        _classCallCheck(this, BaseAnnotations);
    }

    _createClass(BaseAnnotations, [{
        key: '_addMeta',
        value: function _addMeta() {
            throw new Error('implement');
        }
    }, {
        key: '_getName',
        value: function _getName(prefix, path) {
            return prefix + '@' + path.join('.');
        }
    }, {
        key: 'Cursor',
        value: function Cursor(path) {
            var displayName = this._getName('cursor', path);
            return this._addMeta(function (select) {
                return select(path);
            }, {
                displayName: displayName,
                id: displayName,
                deps: [this._Selector]
            });
        }
    }, {
        key: 'Path',
        value: function Path(path) {
            var cur = this.Cursor(path);
            var displayName = this._getName('path', path);
            return this._addMeta(function (cursor) {
                return cursor.get();
            }, {
                displayName: displayName,
                id: displayName,
                isCachedTemporary: true,
                path: path,
                deps: [cur]
            });
        }
    }]);

    return BaseAnnotations;
})();

exports['default'] = BaseAnnotations;
module.exports = exports['default'];
//# sourceMappingURL=BaseAnnotations.js.map