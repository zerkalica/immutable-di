import AbstractCursor from './AbstractCursor'
import {update} from 'tcomb'

function objectFromPath(path: Array<string>) {
    const root = {}
    let pointer = root
    for (let i = 0; i < path.length - 1; i++) {
        const part = path[i]
        pointer = pointer[part] = {}
    }

    return {
        root,
        pointer,
        lastName: path[path.length - 1]
    }
}

export default class TcombCursor<T> extends AbstractCursor<T> {
    _selector = null
    _selectorSpec = {}

    constructor(options) {
        super(options)
        this._selectorSpec =  objectFromPath(this._prefix)
        /* eslint-disable no-new-func */
        this._selector = new Function('s', 'return ' + ['s'].concat(this._prefix).join('.'))
        /* eslint-enable no-new-func */
    }

    toJSON(): string {
        return JSON.stringify(this._stateRoot.state)
    }

    toJS(): object {
        return JSON.parse(JSON.stringify(this._stateRoot.state))
    }

    get(): T {
        return this._selector(this._stateRoot.state)
    }

    at(index: string|number): T {
        return this.get()[index]
    }

    _setState(spec) {
        const {root, pointer, lastName} = this._selectorSpec
        pointer[lastName] = spec
        const oldState = this._stateRoot.state
        const newState = update(oldState, lastName ? root : spec)
        if (newState !== oldState) {
            this._assert(newState)
            this._stateRoot.state = newState
            this._notify()
        }
    }

    set(newState: T): AbstractCursor<T> {
        this._setState({
            $set: newState
        })
        return this
    }

    apply(fn: (v: T) => T): AbstractCursor<T> {
        this._setState({
            $apply: fn
        })
        return this
    }

    assign(newState: Any): AbstractCursor<T> {
        this._setState({
            $merge: newState
        })

        return this
    }
}
