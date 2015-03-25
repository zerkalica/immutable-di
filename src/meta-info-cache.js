import {getDebugPath} from './utils'

export default class MetaInfoCache {
    constructor(adapter) {
        this._adapter = adapter
    }

    get(definition, debugCtx) {
        debugCtx = debugCtx || []
        let debugPath = getDebugPath(debugCtx)
        return this._adapter.extractMetaInfo(definition, debugPath)
    }
}
