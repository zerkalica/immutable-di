import Adapter from './definition-adapters/generic-adapter'

export default class MetaInfoCache {
    constructor(adapter) {
        this._adapter = adapter || Adapter
        this._meta = new Map()
    }

    get(definition, debugPath, fallbackName) {
        const id = this._adapter.idFromDefinition(definition)
        let meta = this._meta.get(id)
        if(!meta) {
            meta = this._adapter.extractMetaInfo(definition, debugPath, fallbackName)
            this._meta.set(id, meta)
        }
        return meta
    }
}
