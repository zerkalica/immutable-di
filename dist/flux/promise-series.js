"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var PromiseSeries = (function () {
    function PromiseSeries() {
        _classCallCheck(this, PromiseSeries);

        this.promise = _Promise.resolve();
        this._count = 0;
    }

    _createClass(PromiseSeries, [{
        key: "add",
        value: function add(cb) {
            var _this = this;

            this._count++;
            this.promise = this.promise.then(cb).then(function (data) {
                _this._resetPromise();
                return data;
            })["catch"](function (err) {
                _this._resetPromise();
                throw err;
            });

            return this.promise;
        }
    }, {
        key: "_resetPromise",
        value: function _resetPromise() {
            this._count--;
            if (this._count === 0) {
                this.promise = _Promise.resolve();
            }
        }
    }]);

    return PromiseSeries;
})();

exports["default"] = PromiseSeries;
module.exports = exports["default"];