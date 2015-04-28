"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

exports.__esModule = true;

var PromiseSeries = (function () {
    function PromiseSeries() {
        _classCallCheck(this, PromiseSeries);

        this.promise = _Promise.resolve();
        this._count = 0;
    }

    PromiseSeries.prototype.add = function add(cb) {
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
    };

    PromiseSeries.prototype._resetPromise = function _resetPromise() {
        this._count--;
        if (this._count === 0) {
            this.promise = _Promise.resolve();
        }
    };

    return PromiseSeries;
})();

exports["default"] = PromiseSeries;
module.exports = exports["default"];