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

export function Semaphore() {
    const locks = {}

    return function semaphore(map) {
        const promises = []
        const keys = Object.keys(map)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            const [needLoad, cb] = map[k]
            promises.push((locks[k] || !needLoad) ? undefined : cb())
            locks[k] = true
        }

        return Promise.all(promises)
            .then(d => {
                const result = {}
                for (let i = 0; i < keys.length; i++) {
                    const k = keys[i]
                    const data = d[i]
                    const set = map[k][2]
                    result[k] = data
                    if (set && data) {
                        set(data)
                    }
                    delete locks[k]
                }
                return result
            })
            .catch(err => {
                for (let i = 0; i < keys.length; i++) {
                    delete locks[keys[i]]
                }
                throw err
            })
    }
}

export function ignore(data) {
    return function _ignore() {
        return data
    }
}
