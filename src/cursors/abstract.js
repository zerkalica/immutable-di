export type PathType = Array<string> | string

export default class AbstractCursor<State> {
    _timerId: number = null
    _affectedPaths: Array<PathType> = []
    __notify: ?(paths: Array<PathType>) => void = null

    constructor(state, {prefix, notify} = {prefix: [], notify: null}) {
        this._state = state || {}
        this.setNotify(notify)
        this._prefix = prefix
    }

    setNotify(notify) {
        this.__notify = notify
    }

    _update(path: PathType) {
        this._affectedPaths.push(path)
        if (!this._timerId) {
            this._timerId = setTimeout(this.commit, 0)
        }
    }

    commit() {
        if (this._timerId) {
            clearTimeout(this._timerId)
            this._timerId = null
        }
        this.__notify(this._affectedPaths)
        this._affectedPaths = []
    }

    createGetter() {
        return ::this.get
    }

    select(path: PathType = []): AbstractCursor<State> {
        return new this.constructor(this.get(path), {
            notify: this.__notify,
            prefix: this._prefix.concat(path)
        })
    }

    get(path: PathType): State {
        throw new Error('implement')
    }

    set(path: PathType, newState: State) {
        throw new Error('implement')
    }

    apply(path: PathType, fn: (v: State) => State) {
        if (fn === undefined) {
            fn = path
            path = []
        } else {
            path = [].concat(path || [])
        }

        this.set(path, fn(this.get(path)))
    }

    merge(path: PathType, data: object) {
        if (data === undefined) {
            data = path
            path = []
        } else {
            path = [].concat(path || [])
        }

        this.set(path, {...this.get(path), ...data})
    }
}
