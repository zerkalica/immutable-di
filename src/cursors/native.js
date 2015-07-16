import AbstractCursor from './abstract'


export default class NativeCursor extends AbstractCursor {
    get() {
        return this._selector(this._state)
    }

    set(newState) {
        const node = this._parentSelector(this._state)
        const key = this._cnName

        if (newState !== node[key]) {
            node[key] = newState
            this._update()
        }

        return this
    }
}
