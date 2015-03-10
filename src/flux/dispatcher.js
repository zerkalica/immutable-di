import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'

export default class Dispatcher {
    constructor({container, stores}) {
        this._container = container
        this._stores = stores
        this._series = new PromiseSeries()
    }

    dispatch(actionType, payload) {
        return this._series.add(() => this.dispatchAsync(actionType, payload))
    }

    dispatchAsync(actionType, payload) {
        return actionToPromise(actionType, payload)
            .then(action => this._getMutations(action))
            .then(mutations => this._container.transformState(mutations))
    }

    _getMutations({actionType, payload, isError, isPromise}) {
        const action = actionType + (isError ? 'Fail' : (isPromise ? 'Success' : ''))

        const method = this._container.createMethod(action, payload)
        const mutations = this._stores.map(store => method.handle(store))

        return Promise.all(mutations)
    }

    reset(state) {
        return this.dispatch('reset')
    }
}
