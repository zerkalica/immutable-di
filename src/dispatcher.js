import {Class, Factory} from './define'
export type ListenerDefType = (v: any) => any

@Class()
export default class Dispatcher {
    _listeners: Array<ListenerDefType>

    constructor() {
        this._listeners = []
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)
    }

    getListeners() {
        return this._listeners
    }

    mount(stateMap: object, listener: ListenerDefType): ListenerDefType {
        const mountedListener = Factory(stateMap)(listener)
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
