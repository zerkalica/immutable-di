'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var _define = require('./define');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('immutable-di:transformer');

var Transformer = (function () {
    function Transformer(adapter, cache) {
        _classCallCheck(this, Transformer);

        this._adapter = adapter;
        this._cache = cache;
    }

    _createClass(Transformer, [{
        key: 'get',
        value: function get(path) {
            return this._adapter.get(path);
        }
    }, {
        key: 'set',
        value: function set(path, value) {
            var _context;

            this._adapter.set(path, value);
            var idsMap = _define.__pathToIdsMap.get(path.toString()) || [];
            debug('upd path: %s; ids: %s; map: %o', path.toString(), idsMap.toString(), _define.__pathToIdsMap);
            idsMap.forEach((_context = this._cache)['delete'].bind(_context));
        }
    }]);

    return Transformer;
})();

exports['default'] = Transformer;
module.exports = exports['default'];