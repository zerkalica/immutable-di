function mapArrayToObject(arr, keys) {
    const result = {}
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = arr[i]
    }

    return result
}

export function spread(obj) {
    const keys = Object.keys(obj)
    const promises = keys.map(k => obj[k])
    function map(values) {
        return mapArrayToObject(values, keys)
    }

    return Promise.all(promises).then(map)
}

export function assign(cb) {
    return function resolveAssign(obj) {
        return spread({
            ...obj,
            ...cb(obj)
        })
    }
}

export function ifError(Err, cb) {
    return function _ifError(e) {
        if (e instanceof Err) {
            cb(e)
        } else {
            throw e
        }
    }
}

export function chain(...reducers) {
    return function startChain(params) {
        let promise = spread(params)
        for (let i = 0; i < reducers.length; i++) {
            promise = promise.then(assign(reducers[i]))
        }

        return promise
    }
}
