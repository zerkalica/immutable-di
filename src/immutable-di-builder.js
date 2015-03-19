import Container from './container'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'
import Dispatcher from './flux/dispatcher'
import StateBinder from './flux/state-binder'

class ImmutableDi {
    constructor({state, globalCache, metaInfoCache, stores, renderer}) {
        const container = this._container = new Container({
            metaInfoCache,
            state,
            globalCache
        })

        const dispatcher = this._dispatcher = new Dispatcher({
            container,
            stores
        })

        this._stateBinder = new StateBinder({container, renderer, dispatcher})
    }

    render(Widget) {
        return this._stateBinder.render(Widget)
    }

    reset() {
        return this._dispatcher.reset()
    }

    get(definition) {
        return this._container.get(definition)
    }
}

export default function ImmutableDiBuilder(stores, renderer) {
    const globalCache = new Map()
    const metaInfoCache = new MetaInfoCache(GenericAdapter)

    return state => new ImmutableDi({
        state,
        stores,
        renderer,
        globalCache,
        metaInfoCache
    })
}
