'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _modelBaseAnnotations = require('../model/BaseAnnotations');

var _modelBaseAnnotations2 = _interopRequireDefault(_modelBaseAnnotations);

var AbstractDefinitionDriver = (function () {
    function AbstractDefinitionDriver() {
        _classCallCheck(this, AbstractDefinitionDriver);

        this.add = this.add.bind(this);
        this.getId = this.getId.bind(this);
        this.getMeta = this.getMeta.bind(this);
    }

    _createClass(AbstractDefinitionDriver, [{
        key: 'setAnnotations',
        value: function setAnnotations(annotations) {
            this._annotations = annotations;
        }
    }, {
        key: 'add',
        value: function add(fn, definition) {
            throw new Error('implement');
        }
    }, {
        key: 'getId',
        value: function getId(fn, debugCtx) {
            throw new Error('implement');
        }
    }, {
        key: 'getMeta',
        value: function getMeta(fn, debugCtx) {
            throw new Error('implement');
        }
    }]);

    return AbstractDefinitionDriver;
})();

exports['default'] = AbstractDefinitionDriver;
module.exports = exports['default'];
//# sourceMappingURL=AbstractDefinitionDriver.js.map