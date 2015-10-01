export type PathType = Array<string>

export default class AbstractCursor<State> {
    __notify: (path: string, isSynced: ?bool) => void = null
    _prefix: PathType
    _pathMap: Map<string, string>

    constructor(
        state: object,
        options
    ) {
        const opts = options || {}
        this._pathMap = opts.pathMap || {}
        this._prefix = opts.prefix || []
        this._state = state || {}

        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.select = ::this.select
        this.apply = ::this.apply
        this.assign = ::this.assign
        this.toJSON = ::this.toJSON
        this.diff = ::this.diff
        this.patch = ::this.patch
        this._update = ::this._update
    }

    setNotify(notify: (path: string, isSynced: ?bool) => void) {
        this.__notify = notify
    }

    _update(isSynced) {
        this.__notify(this._prefix, isSynced)
    }

    commit() {
        this._update(true)
        return this
    }

    select(path: PathType = []): AbstractCursor<State> {
        const mappedId = this._pathMap[path[0]]
        const newPath = mappedId
            ? [mappedId].concat(path.slice(1))
            : path
        const cursor = new this.constructor(
            this._state,
            {
                prefix: this._prefix.concat(newPath),
                pathMap: this._pathMap
            }
        )
        cursor.setNotify(this.__notify)

        return cursor
    }

    /* eslint-disable no-unused-vars */
    toJSON(): string {
        throw new Error('implement')
    }

    snap(): object {
        throw new Error('implement')
    }

    diff(prevState: object): object {
        throw new Error('implement')
    }

    patch(patches: Array) {
        throw new Error('implement')
    }

    get(): State {
        throw new Error('implement')
    }

    set(newState: State) {
        throw new Error('implement')
    }

    apply(fn: (v: State) => State) {
        throw new Error('implement')
    }

    assign(newState: State) {
        throw new Error('implement')
    }
    /* eslint-enable no-unused-vars */
}
