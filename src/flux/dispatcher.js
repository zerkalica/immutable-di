import actionToPromise from './action-to-promise'
import PromiseSeries from './promise-series'
import Container from '../container'

import {Class, Def, getDef} from '../define'

class AutoUnmountListener {
    constructor({listener, dispatcher, definition}) {
        this._handler = this._handler.bind(this)
        this._listener = listener
        this._dispatcher = dispatcher
        this._definition = definition
        this._listenerDef = dispatcher.mount(definition, this._handler)
    }

    _handler(state) {
        const result = this._listener({
            getter: this._definition,
            state: state,
            dispatcher: this._dispatcher
        })
        this._dispatcher.unmount(this._listenerDef)

        return result
    }
}

export default class Dispatcher {
    constructor(container) {
        this._container = container || new Container()
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

    once(definition, listener) {
        const autoListener = new AutoUnmountListener({
            listener,
            definition,
            dispatcher: this
        })

        return autoListener
    }

    reset(state) {
        return this.dispatch('reset', state)
    }

    _getMutationsFromStores(actionObject) {
        const {actionType, payload, isError, isPromise} = actionObject
        console.log(actionObject)
        const action = actionType + (isError ? 'Fail' : (isPromise ? 'Success' : ''))

        const method = this._container.createMethod(action, payload)
        const mutations = this._stores.map(store => method.handle(store))

        return Promise.all(mutations)
    }
}

Class(Dispatcher, [Container])

