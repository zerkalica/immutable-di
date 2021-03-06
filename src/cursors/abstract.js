import Dep from '../utils/Dep'

export type PathType = Array<string>

function pass() {
}

// Dep used instead of define/Class to prevent cross-dependencies
@Dep({isClass: true})
export default class AbstractCursor<State> {
    __notify: (path: string, isSynced: ?bool) => void = null
    _prefix: PathType

    constructor(
        state: object,
        prefix: ?PathType,
        notify: ?(path: string, isSynced: ?bool) => void
    ) {
        this._state = state || {}
        this._prefix = prefix || []
        this.setNotify(notify)

        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.select = ::this.select
        this.apply = ::this.apply
        this.assign = ::this.assign
        this.toJSON = ::this.toJSON
        this.diff = ::this.diff
        this.patch = ::this.patch
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
        return new this.constructor(
            this._state,
            this._prefix.concat(path),
            this.__notify
        )
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
