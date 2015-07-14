export type PathType = Array<string> | string

export default class AbstractCursor<State> {
    _timerId: number = null
    _affectedPaths: Array<PathType> = []
    __notify: ?(paths: Array<PathType>) => void = null

    constructor(state = {}, {prefix, notify} = {prefix: [], notify: null}) {
        this._state = state
        this._prefix = prefix

        this._parentNode = this._getNode(state, prefix.slice(0, -1))
        this._currentNodeName = prefix[prefix.length - 1]
        this._currentNode = this._parentNode[this._currentNodeName]

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

    _update(path: PathType) {
        this._affectedPaths.push(this._prefix.concat(path))
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

    select(path: PathType = []): AbstractCursor<State> {
        return new this.constructor(this._state, {
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
}
