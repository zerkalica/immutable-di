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
    getIn(path) {
        return getIn(this._state, path)
    }
}
