export type PathType = Array<string> | string

export default class AbstractCursor<State> {
    _timerId: number = null
    _affectedPaths: Array<PathType> = []
    __notify: ?(paths: Array<PathType>) => void = null

    constructor(state = {}, {prefix, notify} = {prefix: [], notify: null}) {
        this._state = state
        this._prefix = prefix
        this._cnName = prefix[prefix.length - 1]
        ['s'].concat(prefix) 
        this._parentSelector = new Function('s', 'return s' + 
            (prefix.length ? '.' + prefix.slice(0, -1).join('.') : ''))
        this._selector = new Function('s', 'return s' +
            (prefix.length ? '.' + prefix.join('.') : ''))
        this.setNotify(notify)
        this.commit = ::this.commit
        this.get = ::this.get
        this.set = ::this.set
        this.select = ::this.select
        this.apply = ::this.apply
    }

    setNotify(notify) {
        this.__notify = notify
    }

    _update() {
        this._affectedPaths = this._prefix
        if (!this._timerId) {
            this._timerId = setTimeout(this.commit, 0)
        }
    }

    commit() {
        if (this._timerId) {
            clearTimeout(this._timerId)
            this._timerId = null
        }
        this.__notify([this._affectedPaths])
        this._affectedPaths = []
    }

    select(path: PathType = []): AbstractCursor<State> {
        return new this.constructor(this._state, {
            notify: this.__notify,
            prefix: this._prefix.concat(path)
        })
    }

    get(): State {
        throw new Error('implement')
    }

    set(newState: State) {
        throw new Error('implement')
    }

    apply(fn: (v: State) => State) {
        this.set(fn(this.get()))
    }
}
