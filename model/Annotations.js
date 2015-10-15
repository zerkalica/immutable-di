'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _BaseAnnotations2 = require('./BaseAnnotations');

var _BaseAnnotations3 = _interopRequireDefault(_BaseAnnotations2);

var _driversAbstractDefinitionDriver = require('../drivers/AbstractDefinitionDriver');

var _driversAbstractDefinitionDriver2 = _interopRequireDefault(_driversAbstractDefinitionDriver);

var _Selector = require('./Selector');

var _Selector2 = _interopRequireDefault(_Selector);

var Annotations = (function (_BaseAnnotations) {
    _inherits(Annotations, _BaseAnnotations);

    function Annotations(driver) {
        _classCallCheck(this, Annotations);

        _get(Object.getPrototypeOf(Annotations.prototype), 'constructor', this).call(this);
        this._addMeta = this._addMeta.bind(this);
        this.Cursor = this.Cursor.bind(this);
        this.Path = this.Path.bind(this);

        this.driver = driver;
        driver.setAnnotations(this);
        this._Selector = this.Factory()(_Selector2['default']);

        this.Class = this.Class.bind(this);
        this.Facet = this.Facet.bind(this);
        this.Factory = this.Factory.bind(this);
        this.Def = this.Def.bind(this);

        this.Getter = this.Getter.bind(this);
        this.Setter = this.Setter.bind(this);
        this.Apply = this.Apply.bind(this);
        this.Assign = this.Assign.bind(this);
    }

    _createClass(Annotations, [{
        key: '_addMeta',
        value: function _addMeta(fn, meta) {
            return this.driver.add(fn, meta);
        }

        /**
         * @deprecated: use Cursor
         */
    }, {
        key: '_reflectCursor',
        value: function _reflectCursor(fn, prefix, path) {
            var displayName = this._getName(prefix, path);
            return this._addMeta(fn, {
                displayName: displayName,
                id: displayName,
                deps: [this.Cursor(path)]
            });
        }

        /**
         * @deprecated: use Cursor
         */
    }, {
        key: 'Getter',
        value: function Getter(path) {
            return this._reflectCursor(function (cursor) {
                return cursor.get;
            }, 'getter', path);
        }

        /**
         * @deprecated: use Cursor
         */
    }, {
        key: 'Assign',
        value: function Assign(path) {
            return this._reflectCursor(function (cursor) {
                return cursor.assign;
            }, 'assign', path);
        }

        /**
         * @deprecated: use Cursor
         */
    }, {
        key: 'Setter',
        value: function Setter(path) {
            return this._reflectCursor(function (cursor) {
                return cursor.set;
            }, 'setter', path);
        }

        /**
         * @deprecated: use Cursor
         */
    }, {
        key: 'Apply',
        value: function Apply(path) {
            return this._reflectCursor(function (cursor) {
                return cursor.apply;
            }, 'apply', path);
        }
    }, {
        key: 'Class',
        value: function Class(deps) {
            var add = this._addMeta;
            return function _class(Service) {
                return add(Service, {
                    isClass: true,
                    deps: deps
                });
            };
        }
    }, {
        key: 'Facet',
        value: function Facet(deps) {
            var add = this._addMeta;
            return function facet(Service) {
                return add(Service, {
                    isCachedTemporary: true,
                    deps: deps
                });
            };
        }
    }, {
        key: 'Factory',
        value: function Factory(deps) {
            var add = this._addMeta;
            return function factory(Service) {
                return add(Service, {
                    deps: deps
                });
            };
        }
    }, {
        key: 'Def',
        value: function Def(data) {
            var displayName = 'def@' + JSON.stringify(data);
            return this._addMeta(function () {
                return data;
            }, {
                id: displayName,
                displayName: displayName
            });
        }
    }]);

    return Annotations;
})(_BaseAnnotations3['default']);

exports['default'] = Annotations;
module.exports = exports['default'];
//# sourceMappingURL=Annotations.js.map