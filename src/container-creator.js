import Container from './container'
import MetaInfoCache from './meta-info-cache'
import GenericAdapter from './definition-adapters/generic-adapter'

export default class ContainerCreator {
    constructor() {
        this._globalCache = new Map()
        this._metaInfoCache = new MetaInfoCache(GenericAdapter)
    }

    create(state) {
        return new Container({
            metaInfoCache: this._metaInfoCache,
            state,
            globalCache: this._globalCache
        })
    }
}
