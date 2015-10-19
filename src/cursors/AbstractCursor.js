function noop() {
}

export default class AbstractCursor<T> {
    __notify: (path: string, isSynced: ?bool) => void = null
    _prefix: Array<string>
    _pathMap: {[path: string]: string}

    constructor({
        prefix,
        validate,
        notify,
        stateRoot
    }) {
        this._prefix = prefix
        this._stateRoot = stateRoot
        this._validate = validate
        this._notify = notify || noop

        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.apply = ::this.apply
        this.assign = ::this.assign
        this.toJSON = ::this.toJSON
        this.diff = ::this.diff
        this.patch = ::this.patch
        this._update = ::this._update
    }

    _assert(value) {
        if (this._validate) {
            const errors = this._validate(value)
            if (errors.length) {
                throw new TypeError(errors.join('\n'))
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

    toJS(): object {
        throw new Error('implement')
    }

    diff(prevState: object): object {
        throw new Error('implement')
    }

    patch(patches: Array) {
        throw new Error('implement')
    }

    get(): T {
        throw new Error('implement')
    }

    set(newState: T): AbstractCursor<T> {
        throw new Error('implement')
    }

    apply(fn: (v: T) => T): AbstractCursor<T> {
        throw new Error('implement')
    }

    assign(newState: Any): AbstractCursor<T> {
        throw new Error('implement')
    }
    /* eslint-enable no-unused-vars */
}
