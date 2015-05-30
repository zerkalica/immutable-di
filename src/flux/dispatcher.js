import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'

import {Class, Factory} from '../define'
import getDef from '../define/get'
import __debug from 'debug'
const debug = __debug('immutable-di:dispatcher')

export default class Dispatcher {
    constructor({stores, container}) {
        this._container = container
        this._series = new PromiseSeries()
        this._listeners = []
        this._stores = []
        this._storeIds = []

        this.setStores = this.setStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)
        this.dispatchAsync = this.dispatchAsync.bind(this)
        this.get = this.get.bind(this)

        if (stores) {
            this.setStores(stores)
        }
    }

    setStores(storeMap) {
        const stores = []
        const keys = Object.keys(storeMap)
        for(let i = 0; i < keys.length; i++) {
            stores.push(storeMap[keys[i]])
        }
        this._storeIds = keys.map(k => [k])
        this._stores = stores
        return this
    }

    dispatch(action, payload, progressPayload) {
        actionToPromise(action, payload, progressPayload)
            .forEach(p => this._series.add(() => p.then(o => this.dispatchAsync(o.action, o.payload))))

        return this._series.promise
    }

    dispatchAsync(action, payload) {
        const updatedIds = this._container.transformState(state =>
            this._storeIds.filter((path, index) => {
                const newState = this._stores[index].handle(state.get(path), action, payload)
                if (newState !== undefined) {
                    state.set(path, newState)
                }
                return newState !== undefined
            })
        )
        if (updatedIds) {
            this._listeners.forEach(this._container.getSync)
        }
    }

    get(definition, props) {
        const {getter} = getDef(definition)
        props = props || {}

        return getter
            ? Object.assign(this._container.getSync(getter), props)
            : props
    }

    update(path, transform) {
        function setState(state) {
            state.set(path, transform(state.get(path)))
            return [path]
        }
        this.container.transformState(setState)
        this._listeners.forEach(this._container.getSync)

        return this
    }

    mount(definition, listener) {
        const {id, getter} = getDef(definition)
        this._listeners.push(Factory(listener, [getter], id + '__listener'))

        return listener
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
Class(Dispatcher, {
    container: Container
})
