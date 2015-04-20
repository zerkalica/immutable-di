"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var PromiseSeries = (function () {
    function PromiseSeries() {
        _classCallCheck(this, PromiseSeries);

        this.promise = Promise.resolve();
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
                this.promise = Promise.resolve();
            }
        }
    }]);

    return PromiseSeries;
})();

exports["default"] = PromiseSeries;
module.exports = exports["default"];