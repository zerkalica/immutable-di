import type {PathType} from './state-adapters/abstract-adapter'

import Container from './container'
import {Class, Factory} from './define'
import getDef from './define/get'
import __debug from 'debug'
const debug = __debug('immutable-di:dispatcher')

export type TransformType = (state: any) => any
export type ListenerDefType = (v: any) => any

@Class([Container])
export default class Dispatcher {
    _container: Container
    _listeners: Array<ListenerDefType>

    constructor(container: Container) {
        this._container = container
        this._listeners = []
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)
        this.get = this.get.bind(this)
    }

    get(definition, props) {
        const {getter} = getDef(definition) || {}
        props = props || {}

        return getter
            ? Object.assign(this._container.get(getter), props)
            : props
    }

    update(path: PathType, transform: TransformType): Dispatcher {
        function setState(state) {
            state.set(path, transform(state.get(path)))
            return [path]
        }
        this._container.transformState(setState)
        this._listeners.forEach(this._container.get)

        return this
    }

    mount(definition: (v: any) => any, listener: ListenerDefType): ListenerDefType {
        const {id, getter} = getDef(definition)
        const mountedListener = Factory([getter], id + '__listener')(listener)
        this._listeners.push(mountedListener)

        return mountedListener
    }

    unmount(listenerDef: ListenerDefType): Dispatcher {
        this._listeners = this._listeners.filter(d => listenerDef !== d)

        return this
    }

    once(definition: (v: any) => any, listener: (v: any) => any): Dispatcher {
        const listenerDef = this.mount(definition, (...args) => {
            this.unmount(listenerDef)
            return listener(...args)
        })

        return this
    }
}
