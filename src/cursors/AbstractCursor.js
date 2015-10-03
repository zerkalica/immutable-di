export type PathType = Array<string>

export default class AbstractCursor<State> {
    __notify: (path: string, isSynced: ?bool) => void = null
    _prefix: PathType
    _pathMap: Map<string, string>

    constructor({
        pathMap,
        prefix,
        state,
        validate,
        notify
    }) {
        this._pathMap = pathMap
        this._prefix = prefix
        this._state = state
        this._validate = validate
        this._notify = notify

        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.apply = ::this.apply
        this.assign = ::this.assign
        this.toJSON = ::this.toJSON
        this.diff = ::this.diff
        this.patch = ::this.patch
        this._update = ::this._update

        this._assert(this._state)
    }

    _assert(value, key) {
        if (this._validate) {
            const errors = this._validate(value, key)
            if (errors.length) {
                throw new TypeError(errors.map(e => e.message).join('\n'))
            }
        }
    }

    _update(isSynced) {
        this._notify(this._prefix, isSynced)
    }

    commit() {
        this._update(true)
        return this
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
