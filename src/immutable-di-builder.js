import Container from './container'
import Invoker from './invoker'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'

class ImmutableDi {
    constructor ({state, globalCache, metaInfoCache}) {
        this._meta = metaInfoCache

        this._container = new Container({
            state: state,
            metaInfoCache: this._meta,
            globalCache: globalCache
        })
    }

    clear(scope) {
        this._container.clear(scope)
    }

    createMethod(actionType, payload) {
        return new Invoker({
            metaInfoCache: this._meta,
            container: this._container,
            actionType: actionType,
            payload: payload
        })
    }

    get(definition) {
        return this._container.get(definition)
    }
}

export default function ImmutableDiBuilder() {
    const cache = new Map()
    const meta = new MetaInfoCache(GenericAdapter)

    return state => new ImmutableDi({
        state: state,
        globalCache: cache,
        metaInfoCache: meta
    })
}
