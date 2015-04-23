import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'

import {Class, getDef, Factory, createGetter} from '../define'
import __debug from 'debug'

const debug = __debug('immutable-di:dispatcher')

export default class Dispatcher {
    constructor({stores, state, container}) {
        this._container = container || new Container({state})
        this._series = new PromiseSeries()
        this._listeners = []
        this._stores = []
        this._storeIds = []

        this.setStores = this.setStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)
        this.dispatchAsync = this.dispatchAsync.bind(this)

        if (stores) {
            this.setStores(stores)
        }
    }

    setStores(storeMap) {
        const stores = []
        const keys = this._storeIds = Object.keys(storeMap)
        for(let i = 0; i < keys.length; i++) {
            stores.push(storeMap[keys[i]])
        }
        this._stores = stores
        return this
    }

    dispatch(action, payload) {
        actionToPromise(action, payload)
            .forEach(p => this._series.add(() => p.then(o => this.dispatchAsync(o.action, o.payload))))

        return this._series.promise
    }

    dispatchAsync(action, payload) {
        const handler = ({index, id, get}) => this._stores[index].handle(get(id), action, payload)
        debug('dispatchAsync %s:%o', action, payload)
        const updatedScopes = this._container.transformState(p => this._stateTransformer(p, handler))
        return updatedScopes.length
            ? Promise.all(this._listeners.map(this._container.getSync))
            : false
    }

    mount(definition, listener) {
        const {id} = getDef(definition)
        this._listeners.push(Factory(listener, [definition], id + '__listener'))

        return listener
    }

    unmount(listenerDef) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(definition, resolve) {
        if (Array.isArray(definition) || typeof definition === 'object') {
            definition = createGetter(definition)
        }
        const {getter} = getDef(definition)
        const listenerDef = this.mount(getter, (...args) => {
            this.unmount(listenerDef)
            return resolve(...args)
        })

        return this
    }

    _stateTransformer({get, set}, getState) {
        return this._storeIds.filter((id, index) => {
            const state = getState({id, index, get})
            const isHandled = state !== undefined
            if (isHandled) {
                set(id, state)
            }
            return isHandled
        })
    }
}
Class(Dispatcher, {container: Container})
