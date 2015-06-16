import Dispatcher from './dispatcher'
import Container from './container'
import {Class, Factory} from './define'
import type {PathType} from './state-adapters/abstract-adapter'
import type {Transformer} from './transformer'

@Class([Dispatcher, Container])
export default class Cursor {
    _dispatcher: Dispatcher
    _container: Container
    _async: bool
    _timeOutInProgress: bool

    constructor(
        dispatcher: Dispatcher,
        container: Container,
        async: bool = true,
        prefix: ?PathType = []
    ) {
        this._dispatcher = dispatcher
        this._container = container
        this._prefix = prefix
        this._async = async
        this._timeOutInProgress = false
    }

    select(path: PathType): Cursor {
        return new Cursor(
            this._dispatcher,
            this._container,
            this._async, 
            this._prefix.concat(path)
        )
    }

    set(path: PathType, fn: (v: any) => any) {
        const transform = typeof fn === 'function' ?
            fn :
            () => fn 
        const p = this._prefix.concat(path)
        this._container.transformState(
            (state: Transformer) => state.set(p, transform(state.get(p)))
        )

        if (this._async && !this._timeOutInProgress) {
            this._timeOutInProgress = true
            setTimeout(() => {
                this._updateListeners()
                this._timeOutInProgress = false
            }, 0)
        } else {
            this._updateListeners()
        }
    }

    _updateListeners() {
        this._dispatcher.getListeners().forEach(listener => this._container.get(listener))
    }

    get(path: PathType) {
        return this._container._state.get(this._prefix.concat(path))
    }
}
