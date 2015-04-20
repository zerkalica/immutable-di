'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = actionToPromise;

function actionToPromise(action, payload) {
    var actionPromises = [];
    if (typeof payload === 'object' && typeof payload.then === 'function') {
        actionPromises.push(Promise.resolve({
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
        actionPromises.push(Promise.resolve({
            action: action,
            payload: payload
        }));
    }

    return actionPromises;
}

module.exports = exports['default'];