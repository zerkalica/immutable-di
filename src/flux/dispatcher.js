import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'

import {Class, getDef, Factory, createGetter} from '../define'
import debug from 'debug'

const info = debug('immutable-di:dispatcher')

export default class Dispatcher {
    constructor({stores, state, container}) {
        this._container = container || new Container({state})
        this._series = new PromiseSeries()
        this._listeners = []
        this._stores = []
        this._storeIds = []

        this.setStores = this.setStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.dispatchAsync = this.dispatchAsync.bind(this)
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)

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
        return this._series.add(() => this.dispatchAsync(action, payload))
    }

    dispatchAsync(action, payload) {
        const promiseAction = actionToPromise(action, payload)
        let promise = this._invokeDispatch(promiseAction[0])
        for (let i = 1; i < promiseAction.length; i++) {
            promise = promise.then(() => this._invokeDispatch(promiseAction[i]))
        }

        return promise
    }

    _invokeDispatch(actionPromise) {
        return actionPromise
            .then(({action, payload}) => this._transformState(action, payload))
    }

    mount(definition, listener) {
        const {id} = getDef(definition)
        Factory(listener, [definition], id + '__listener')
        this._listeners.push(listener)

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
            resolve(...args)
        })

        return this
    }

    _invokeListeners() {
        return this._listeners.map(listener => this._container.get(listener))
    }

    _stateTransformer({get, set}, getState) {
            const updatedIds = []
            this._storeIds.forEach((id, index) => {
                const state = getState({id, index, get})
                if (state) {
                    if (state !== true) {
                        set(id, state)
                    }
                    updatedIds.push(id)
                }
            })

            return updatedIds
    }

    _transformState(action, payload) {
        const handler = ({index, id, get}) => this._stores[index].handle(get(id), action, payload)
        info('_transformState %s:%o', action, payload)
        this._container.transformState(p => this._stateTransformer(p, handler))
        return Promise.all(this._invokeListeners())
    }
}

Class(Dispatcher, {container: Container})
