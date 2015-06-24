import AbstractCursor from './abstract'

function getInPath(obj, bits) {
    try {
        for(let i = 0, j = bits.length; i < j; ++i) {
            obj = obj[bits[i]]
        }
    } catch (e) {
        e.message = e.message + ': ' + bits.join('.')
        throw e
    }

    return obj
}

export default class NativeCursor extends AbstractCursor {
    get(path) {
        return getInPath(this._state, [].concat(path || []))
    }

    set(path, newState) {
        if (newState === undefined) {
            newState = path
            path = []
        } else {
            path = [].concat(path || [])
        }

        if (!path.length) {
            const keys = Object.keys(this._state)
            for (let i = 0, j = keys.length; i < j; i++) {
                delete this._state[keys[i]]
            }
            Object.assign(this._state, newState)
        } else {
            const statePart = this.get(path.slice(0, -1))
            statePart[path[path.length - 1]] = newState
        }

        this._update(path)
        return this
    }
}
