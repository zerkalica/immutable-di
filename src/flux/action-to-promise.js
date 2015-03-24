export default function actionToPromise(actionType, payload) {
    let actionItem
    if (typeof payload === 'object' && typeof payload.then === 'function') {
        actionItem = payload
            .then(payload => ({
                actionType: actionType,
                payload: payload,
                isError: false,
                isPromise: true
            }))
            .catch(err => ({
                actionType: actionType,
                payload: err,
                isError: true,
                isPromise: true
            }))
    } else {
        actionItem = Promise.resolve({
            actionType: actionType,
            payload: payload,
            isError: false,
            isPromise: false
        })
    }
    return actionItem
}
