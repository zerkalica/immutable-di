"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var PromiseSeries = (function () {
    function PromiseSeries() {
        _classCallCheck(this, PromiseSeries);

        this.promise = null;
        this._count = 1;
        this._resetPromise();
    }

    _prototypeProperties(PromiseSeries, null, {
        add: {
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
            },
            writable: true,
            configurable: true
        },
        _resetPromise: {
            value: function _resetPromise() {
                this._count--;
                if (this._count === 0) {
                    this.promise = new Promise(function (resolve) {
                        return resolve();
                    });
                }
            },
            writable: true,
            configurable: true
        }
    });

    return PromiseSeries;
})();

module.exports = PromiseSeries;