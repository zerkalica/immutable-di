import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'

import {Class, Def, getDef} from '../define'

export default class Dispatcher {
    constructor(container) {
        this._container = container
        this._series = new PromiseSeries()
        this._listeners = []

        this.setStores = this.setStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.dispatchAsync = this.dispatchAsync.bind(this)
        this.mount = this.mount.bind(this)
        this.unmount = this.unmount.bind(this)
        this.reset = this.reset.bind(this)
    }

    setStores(stores) {
        this._stores = stores
        return this
    }

    dispatch(actionType, payload) {
        return this._series.add(() => this.dispatchAsync(actionType, payload))
    }

    dispatchAsync(actionType, payload) {
        return actionToPromise(actionType, payload)
            .then(action => this._getMutationsFromStores(action))
            .then(mutations => this._container.transformState(mutations))
            .then(() => this._listeners.forEach(listener => this._container.get(listener)))
    }

    mount(definition, listener) {
        const {id} = getDef(definition)
        const listenerDef = Def(p => p, {
            id: id + '__listener',
            deps: [definition],
            handler: p => listener(p)
        })
        this._listeners.push(listenerDef)

        return listenerDef
    }

    unmount(listenerDef) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    reset(state) {
        return this.dispatch('reset', state)
    }

    _getMutationsFromStores({actionType, payload, isError, isPromise}) {
        const action = actionType + (isError ? 'Fail' : (isPromise ? 'Success' : ''))

        const method = this._container.createMethod(action, payload)
        const mutations = this._stores.map(store => method.handle(store))

        return Promise.all(mutations)
    }
}

Class(Dispatcher, [Container])

