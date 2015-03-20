import Container from './container'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'
import Dispatcher from './flux/dispatcher'
import StateBinder from './flux/state-binder'

export default class ContainerCreator {
    constructor({stores, renderer}) {
        this._stores = stores
        this._renderer = renderer
        this._globalCache = new Map()
        this._metaInfoCache = new MetaInfoCache(GenericAdapter)
    }

    create(state) {
        const container = new Container({
            metaInfoCache: this._metaInfoCache,
            state,
            globalCache: this._globalCache
        })
        container.get(Dispatcher).setStores(this._stores)
        container.get(StateBinder).setRenderer(this._renderer)

        return container
    }
}
