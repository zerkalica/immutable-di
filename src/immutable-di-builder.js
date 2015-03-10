import Container from './container'
import Invoker from './invoker'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'

class ImmutableDi {
    constructor({state, globalCache, metaInfoCache, listeners}) {
        this._meta = metaInfoCache
        this._state = state
        this._container = new Container({
            metaInfoCache: this._meta,
            state,
            globalCache
        })
        this._listeners = listeners || []
    }

    transformState(mutations) {
        const container = this._container
        const updatedScopes = this._state.transformState(mutations)
        updatedScopes.forEach(scope => container.clear(scope))
        this._listeners.forEach(listener => container.get(listener))
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

export default function ImmutableDiBuilder(listeners) {
    const globalCache = new Map()
    const metaInfoCache = new MetaInfoCache(GenericAdapter)

    return state => new ImmutableDi({
        state,
        listeners,
        globalCache,
        metaInfoCache
    })
}
