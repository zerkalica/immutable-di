'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

exports.__esModule = true;
exports['default'] = actionToPromise;

function actionToPromise(action, payload) {
    var actionPromises = [];
    if (typeof payload === 'object' && typeof payload.then === 'function') {
        actionPromises.push(_Promise.resolve({
            action: action + 'Progress',
            payload: {}
        }));
        actionPromises.push(payload.then(function (payload) {
            return {
                action: action + 'Success',
                payload: payload
            };
        })['catch'](function (err) {
            return {
                action: action + 'Fail',
                payload: err
            };
        }));
    } else {
        actionPromises.push(_Promise.resolve({
            action: action,
            payload: payload
        }));
    }

    return actionPromises;
}

module.exports = exports['default'];