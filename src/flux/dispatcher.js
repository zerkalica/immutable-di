import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'

export default class Dispatcher {
    constructor({container, stores}) {
        this._container = container
        this._series = new PromiseSeries()

        this._stores = stores
        this._listeners = []
    }

    mount(definition) {
        this._listeners.push(definition)
    }

    unmount(definition) {
        this._listeners = this._listeners.filter(d => definition === d)
    }

    _update() {
        this._listeners.forEach(listener => this._container.get(listener))
    }

    dispatch(actionType, payload) {
        return this._series.add(() => this.dispatchAsync(actionType, payload))
    }

    dispatchAsync(actionType, payload) {
        return actionToPromise(actionType, payload)
            .then(action => this._getMutationsFromStores(action))
            .then(mutations => this._container.transformState(mutations))
            .then(() => this._update())
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
