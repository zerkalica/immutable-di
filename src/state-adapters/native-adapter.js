import AbstractStateAdapter from './abstract-adapter'

function getInPath(obj, bits) {
    if (bits) {
        try {
            for(let i = 0, j = bits.length; i < j; ++i) {
                obj = obj[bits[i]]
            }
        } catch (e) {
            e.message = e.message + ': ' + bits.join('.')
            throw e
        }
    }

    return obj
}

export default class NativeAdapter extends AbstractStateAdapter {
    constructor(state) {
        super(state)
        this._state = state || {}
    }

    select(path) {
        return new NativeAdapter(this.get(path))
    }

    get(path) {
        return getInPath(this._state, path)
    }

    set(path, newState) {
        if (!path || !path.length) {
            this._state = newState
        } else {
            const statePart = this.get(path.slice(0, -1))
            statePart[path[path.length - 1]] = newState
        }

        this._update(path)
        return this
    }
}
