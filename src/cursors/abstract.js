export type PathType = Array<string>

export default class AbstractCursor<State> {
    __notify: ?(paths: PathType) => void = null

    constructor(state = {}, {prefix, notify} = {prefix: [], notify: null}) {
        this._state = state
        this._prefix = prefix
        this.setNotify(notify)

        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.select = ::this.select
        this.apply = ::this.apply
        this.assign = ::this.assign
    }

    setNotify(notify) {
        this.__notify = notify
    }

    _update() {
        this.__notify(this._prefix)
    }

    commit() {
        this.__notify(this._prefix, true)
        return this
    }

    select(path: PathType = []): AbstractCursor<State> {
        return new this.constructor(this._state, {
            notify: this.__notify,
            prefix: this._prefix.concat(path)
        })
    }

    /* eslint-disable no-unused-vars */
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
