import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import StateHandler from './state-handler'

export default class Dispatcher {
    constructor({container, stores}) {
        this._container = container
        this._stores = stores
        this._listeners = []
        this._series = new PromiseSeries()
    }

    dispatch(actionType, payload) {
        return this._series.add(() => this.dispatchAsync(actionType, payload))
    }

    dispatchAsync(actionType, payload) {
        return actionToPromise(actionType, payload)
            .then(action => this._getMutations(action))
            .then(mutations => this._container.transformState(mutations))
            .then(a => this._listeners.forEach(listener => this._container.get(listener)))
    }

    createStateHandler(definition) {
        return this._container.get(definition)
            .then(initialState => new StateHandler({definition, dispatcher: this, initialState}))
    }

    mount(listener) {
        this._listeners.push(listener)
    }

    unmount(targetListener) {
        this._listeners = this._listeners.filter(listener => targetListener !== listener)
    }

    reset() {
        return this.dispatch('reset')
    }

    _getMutations({actionType, payload, isError, isPromise}) {
        const action = actionType + (isError ? 'Fail' : (isPromise ? 'Success' : ''))

        const method = this._container.createMethod(action, payload)
        const mutations = this._stores.map(store => method.handle(store))

        return Promise.all(mutations)
    }
}
