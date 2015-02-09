function getIn(obj, bits) {
    for(let i = 0, j = bits.length; i < j; ++i) {
        let bit = bits[i]
        if (!obj.hasOwnProperty(bit) {
            obj[bit] = {}
        }
        obj = obj[bit]
    }
    return obj
}

export default class NativeAdapter {
    constructor(state) {
        this._state = state || {}
    }
    isEqual(next) {
        return this._state === next
    }
    isEqualIn(next, path) {
        return this.isEqual(getIn(this._state, path), getIn(next, path))
    }
    getIn(path) {
        return getIn(this._state, path)
    }
    set(state) {
        this._state = state
    }
    transform(cb) {
        cb(
            key => getIn(this._state, key),
            (key, value) => {
                getIn(this._state, key) = value
            }
        )
        return this._state
    }
}
