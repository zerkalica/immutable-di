import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'
import Listeners from './listeners'

import {bindAll} from '../utils'
import {Class} from '../define'

export default class Dispatcher {
    constructor(container, listeners) {
        this._container = container
        this._series = new PromiseSeries()
        this._listeners = listeners
        bindAll(this)
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

    reset() {
        return this.dispatch('reset')
    }

    _getMutationsFromStores({actionType, payload, isError, isPromise}) {
        const action = actionType + (isError ? 'Fail' : (isPromise ? 'Success' : ''))

        const method = this._container.createMethod(action, payload)
        const mutations = this._stores.map(store => method.handle(store))

        return Promise.all(mutations)
    }
}

Class(Dispatcher, [Container, Listeners])
