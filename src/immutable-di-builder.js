import Container from './container'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'
import Dispatcher from './flux/dispatcher'

class ImmutableDi {
    constructor({state, globalCache, metaInfoCache, stores, renderAdapter}) {
        const container = this._container = new Container({
            metaInfoCache,
            state,
            globalCache
        })

        this._dispatcher = new Dispatcher({
            container,
            stores
        })

        this._renderAdapter = renderAdapter
    }

    render(Widget) {
        return this._dispatcher.createStateHandler(this._renderAdapter.getDefinition(Widget))
            .then(this._renderAdapter.render(Widget))
    }

    dispatch(actionType, payload) {
        return this._dispatcher.dispatch(actionType, payload)
    }

    dispatchAsync(actionType, payload) {
        return this._dispatcher.dispatchAsync(actionType, payload)
    }

    reset() {
        return this._dispatcher.reset()
    }

    get(definition) {
        return this._container.get(definition)
    }
}

export default function ImmutableDiBuilder(stores, renderAdapter) {
    const globalCache = new Map()
    const metaInfoCache = new MetaInfoCache(GenericAdapter)

    return state => new ImmutableDi({
        state,
        stores,
        renderAdapter,
        globalCache,
        metaInfoCache
    })
}
