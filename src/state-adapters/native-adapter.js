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

    get(id) {
        return this._state[id]
    }

    deserialize(data) {
        this._state = JSON.parse(data)
        return this
    }

    serialize() {
        return JSON.stringify(this._state)
    }

    transformState(transform) {
        return transform({
            get: (id) => this._state[id],
            set: (id, newState) => {
                this._state[id] = newState
            }
        })
    }
}
