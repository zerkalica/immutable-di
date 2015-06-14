import Container from '../container'

import {Class, Factory} from '../define'
import getDef from '../define/get'
import __debug from 'debug'
const debug = __debug('immutable-di:dispatcher')

@Class({
    container: Container
})
export default class Dispatcher {
    constructor(container) {
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

    update(path: Array<string>, transform: (v: Array<string>) => object) {
        path = Array.isArray(path) ? path : path.split('.')
        function setState(state) {
            state.set(path, transform(state.get(path)))
            return [path]
        }
        this._container.transformState(setState)
        this._listeners.forEach(this._container.get)

        return this
    }

    mount(spec, listener) {
        const listenerDef = Factory(spec)(listener)
        this._listeners.push(listenerDef)

        return listenerDef
    }

    unmount(listenerDef) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(definition, listener) {
        const listenerDef = this.mount(definition, (...args) => {
            this.unmount(listenerDef)
            return listener(...args)
        })

        return this
    }
}
