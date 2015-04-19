export default function actionToPromise(action, payload) {
    let actionPromises = []
    if (typeof payload === 'object' && typeof payload.then === 'function') {
        actionPromises.push(Promise.resolve({
            action: action + 'Progress',
            payload: {}
        }))
        actionPromises.push(payload
            .then(payload => ({
                action: action + 'Success',
                payload: payload
            }))
            .catch(err => ({
                action: action + 'Fail',
                payload: err
            }))
        )
    } else {
        actionPromises.push(Promise.resolve({
            action: action,
            payload: payload
        }))
    }

    return actionPromises
}
