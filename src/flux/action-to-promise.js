function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function'
}

export default function actionToPromise(actionType, payload) {
    let actionItem
    if (isPromise(payload)) {
        actionItem = payload
            .then(payload => {
                return {
                    actionType: actionType,
                    payload: payload,
                    isError: false,
                    isPromise: true
                }
            })
            .catch(err => {
                return {
                    actionType: actionType,
                    payload: err,
                    isError: true,
                    isPromise: true
                }
            })
    } else {
        actionItem = new Promise((resolve, reject) => {
            resolve({
                actionType: actionType,
                payload: payload,
                isError: false,
                isPromise: false
            })
        })
    }
    return actionItem
}
