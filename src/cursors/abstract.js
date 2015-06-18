export type PathType = Array<string>

export default class AbstractCursor<State> {
    setUpdater(update) {
        this._update = update
    }

    select(path: PathType): AbstractCursor<State> {
        return new this.constructor(this.get(path))
    }

    _update() {

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
