function getInPath(obj, bits) {
    if (bits) {
        try {
            for(let i = 0, j = bits.length; i < j; ++i) {
                obj = obj[bits[i]]
            }
        } catch (e) {
            e.message = e.message + ': ' + bits
            throw e
        }
    }

    return obj
}

export default class NativeAdapter {
    constructor(state) {
        this._state = state || {}
        this.getIn = this.getIn.bind(this)
        this._setIn = this._setIn.bind(this)
    }

    getIn(path) {
        return getInPath(this._state, path)
    }

    _setIn(path, newState) {
        if (!path || !path.length) {
            this._state = newState
        } else {
            const statePart = this.getIn(path.slice(0, -1))
            statePart[path[path.length - 1]] = newState
        }
        return this
    }

    transformState(transform) {
        return transform({
            get: this.getIn,
            set: this._setIn
        })
    }
}
