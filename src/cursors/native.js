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
}
