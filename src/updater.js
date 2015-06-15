import Dispatcher from './dispatcher'
import Container from './container'
import {Class, Factory} from './define'
import type {PathType} from './state-adapters/abstract-adapter'
import type {Transformer} from './transformer'

@Class([Dispatcher, Container])
export default class Updater {
    _dispatcher: Dispatcher
    _container: Container

    constructor(dispatcher: Dispatcher, container: Container) {
        this._dispatcher = dispatcher
        this._container = container
    }

    set(path: PathType, data) {
        this._container.transformState(
            (state: Transformer) => state.set(path, transform(state.get(path)))
        )
        this._dispatcher.getListeners().forEach(listener => this._container.get(listener))
    }

    get(path: PathType) {
        return this._container._state.get(path)
    }
}
