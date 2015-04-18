"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _define = require("../define");

var Class = _define.Class;
var Def = _define.Def;

var Updater = (function () {
    function Updater(_ref) {
        var id = _ref.id;
        var deps = _ref.deps;
        var listeners = _ref.listeners;

        this.update = function (p) {
            return p;
        };

        _classCallCheck(this, Updater);

        this._id = id;
        this._deps = deps;
        this._listeners = listeners;
        this._def = null;
    }

    _prototypeProperties(Updater, null, {
        mount: {
            value: function mount(onUpdate) {
                this._def = this._listeners.mount({
                    id: this._id,
                    deps: this._deps,
                    onUpdate: onUpdate
                });
            },
            writable: true,
            configurable: true
        },
        unmount: {
            value: function unmount() {
                this._listeners.unmount(this._def);
                this._def = null;
            },
            writable: true,
            configurable: true
        }
    });

    return Updater;
})();

var Listeners = (function () {
    function Listeners() {
        _classCallCheck(this, Listeners);

        this._listeners = [];
    }

    _prototypeProperties(Listeners, null, {
        createUpdater: {
            value: function createUpdater(_ref) {
                var id = _ref.id;
                var deps = _ref.deps;

                return new Updater({ id: id, deps: deps, listeners: this });
            },
            writable: true,
            configurable: true
        },
        mount: {
            value: function mount(_ref) {
                var id = _ref.id;
                var deps = _ref.deps;
                var onUpdate = _ref.onUpdate;

                var definition = Def({ id: id, deps: deps, handler: onUpdate });
                this._listeners.push(definition);
                return definition;
            },
            writable: true,
            configurable: true
        },
        unmount: {
            value: function unmount(definition) {
                this._listeners = this._listeners.filter(function (d) {
                    return definition === d;
                });
            },
            writable: true,
            configurable: true
        },
        forEach: {
            value: function forEach(cb) {
                this._listeners.forEach(function (listener) {
                    return cb(listener);
                });
            },
            writable: true,
            configurable: true
        }
    });

    return Listeners;
})();

module.exports = Listeners;

Class(Listeners);