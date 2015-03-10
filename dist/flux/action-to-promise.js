"use strict";

module.exports = actionToPromise;
function isPromise(data) {
    return typeof data === "object" && typeof data.then === "function";
}

function actionToPromise(actionType, payload) {
    var actionItem = undefined;
    if (isPromise(payload)) {
        actionItem = payload.then(function (payload) {
            return {
                actionType: actionType,
                payload: payload,
                isError: false,
                isPromise: true
            };
        })["catch"](function (err) {
            return {
                actionType: actionType,
                payload: err,
                isError: true,
                isPromise: true
            };
        });
    } else {
        actionItem = new Promise(function (resolve, reject) {
            resolve({
                actionType: actionType,
                payload: payload,
                isError: false,
                isPromise: false
            });
        });
    }
    return actionItem;
}