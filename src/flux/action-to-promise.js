function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function'
}

export default function actionToPromise(actionType, payload) {
    let actionItem
    if (isPromise(payload)) {
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
