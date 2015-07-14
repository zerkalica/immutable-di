import AbstractCursor from './abstract'


export default class NativeCursor extends AbstractCursor {
    get(path) {
        return this._getNode(this._parentNode[this._currentNodeName], path)
    }

    _getNode(obj, bits = []) {
        try {
            for(let i = 0, j = bits.length; i < j; ++i) {
                obj = obj[bits[i]]
            }
        } catch (e) {
            e.message = e.message + ': ' + this._prefix.concat(bits).join('.')
            throw e
        }

        return obj
    }

    set(path, newState) {
        if (newState === undefined) {
            newState = path
            path = []
        } else {
            path = [].concat(path || [])
        }
        let node
        let key
        if (!path.length) {
            node = this._parentNode
            key = this._currentNodeName
        } else {
            node = this._getNode(this._currentNode, path.slice(0, -1))
            key = path[path.length - 1]
        }

        if (newState !== node[key]) {
            node[key] = newState
            this._update(path)
        }

        return this
    }
}
