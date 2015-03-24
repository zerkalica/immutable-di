"use strict";

module.exports = actionToPromise;
function actionToPromise(actionType, payload) {
    var actionItem = undefined;
    if (typeof payload === "object" && typeof payload.then === "function") {
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
        actionItem = Promise.resolve({
            actionType: actionType,
            payload: payload,
            isError: false,
            isPromise: false
        });
    }
    return actionItem;
}