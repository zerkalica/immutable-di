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
        let isUpdated = false
        if (!path.length) {
            throw new Error('path is empty')
        } else {
            const statePart = this.get(path.slice(0, -1))
            const key = path[path.length - 1]
            isUpdated = newState !== statePart[key]
            statePart[key] = newState
        }

        if (isUpdated) {
            this._update(path)
        }

        return this
    }
}
