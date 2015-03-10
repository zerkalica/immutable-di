import Container from './container'
import Invoker from './invoker'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'
import Dispatcher from './flux/dispatcher'

class ImmutableDi {
    constructor({state, globalCache, metaInfoCache, listeners, stores}) {
        this._meta = metaInfoCache
        this._state = state
        this._container = new Container({
            metaInfoCache: this._meta,
            state,
            globalCache
        })
        this._listeners = listeners || []
        this._dispatcher = new Dispatcher({
            container: this._container,
            stores: (stores || []).map(store => this._container.get(store))
        })
    }

    transformState(mutations) {
        const container = this._container
        const updatedScopes = this._state.transformState(mutations)
        updatedScopes.forEach(scope => container.clear(scope))
        this._listeners.forEach(listener => container.get(listener))
    }

    getDispatcher() {
        return this._dispatcher
    }

    createMethod(actionType, payload) {
        const getPayload = payload === void 0 ? (id => this._state.get(id)) : (id => this._payload)

        return new Invoker({
            metaInfoCache: this._meta,
            container: this._container,
            actionType,
            getPayload
        })
    }

    get(definition) {
        return this._container.get(definition)
    }
}

export default function ImmutableDiBuilder(listeners, stores) {
    const globalCache = new Map()
    const metaInfoCache = new MetaInfoCache(GenericAdapter)

    return state => new ImmutableDi({
        state,
        listeners,
        stores,
        globalCache,
        metaInfoCache
    })
}
