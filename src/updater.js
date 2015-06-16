import Dispatcher from './dispatcher'
import Container from './container'
import {Class, Factory} from './define'
import type {PathType} from './state-adapters/abstract-adapter'
import type {Transformer} from './transformer'

@Class([Dispatcher, Container])
export default class Updater {
    _dispatcher: Dispatcher
    _container: Container

    constructor(dispatcher: Dispatcher, container: Container, prefix: ?PathType = []) {
        this._dispatcher = dispatcher
        this._container = container
        this._prefix = prefix
    }

    select(path: PathType): Updater {
        return new Updater(this._dispatcher, this._container, this._prefix.concat(path))
    }

    set(path: PathType, transform: (v: any) => any) {
        if (typeof transform !== 'function') {
            transform = () => transform
        }
        const p = this._prefix.concat(path)
        this._container.transformState(
            (state: Transformer) => state.set(p, transform(state.get(p)))
        )
        this._dispatcher.getListeners().forEach(listener => this._container.get(listener))
    }

    merge(path, fn) {
        if (typeof fn !== 'function') {
            fn = () => fn
        }
        return this.set(path, state => Object.assign({}, state, fn(state)))
    }

    get(path: PathType) {
        return this._container._state.get(path)
    }
}
