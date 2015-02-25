function getInPath(obj, bits) {
    for(let i = 0, j = bits.length; i < j; ++i) {
        obj = obj[bits[i]]
    }
    return obj
}

export default class NativeAdapter {
    constructor(state) {
        this._state = state || {}
    }
    getIn(path) {
        return getInPath(this._state, path)
    }
}
