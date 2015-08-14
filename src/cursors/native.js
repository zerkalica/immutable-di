import AbstractCursor from './abstract'


export default class NativeCursor extends AbstractCursor {
    get() {
        return this._selector(this._state)[this._cnName]
    }

    set(newState) {
        const node = this._selector(this._state)
        if (newState !== node[this._cnName]) {
            node[this._cnName] = newState
            this._update()
        }

        return this
    }

    assign(newState) {
        const node = this._selector(this._state)[this._cnName]
        let isUpdated = false
        const keys = Object.keys(newState)
        for (let i = 0, j = keys.length; i < j; i++) {
            const k = keys[i]
            if (node[k] !== newState[k]) {
                node[k] = newState[k]
                isUpdated = true
            }
        }
        if (isUpdated) {
            this._update()
        }

        return this
    }
}
