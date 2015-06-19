export type PathType = Array<string>

export default class AbstractCursor<State> {
    constructor(state, update, prefix = []) {
        this._state = state || {}
        this.setUpdate(update)
        this._prefix = prefix
    }

    setUpdate(update) {
        this.__update = update
    }

    _update(path: PathType) {
        this.__update(this._prefix.concat(path))
    }

    select(path: PathType): AbstractCursor<State> {
        return new this.constructor(this.get(path), this.__update, this._prefix.concat(path))
    }

    get(path: PathType): State {
        throw new Error('implement')
    }

    set(path: PathType, newState: State) {
        throw new Error('implement')
    }

    apply(path: PathType, fn: (v: State) => State) {
        this.set(path, fn(this.get(path)))
    }
}
