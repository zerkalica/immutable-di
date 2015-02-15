import {getDebugPath} from './utils'

export default class MetaInfoCache {
    constructor(adapter) {
        this._adapter = adapter
        this._meta = new Map()
    }

    get(definition, debugCtx) {
        debugCtx = debugCtx || []
        let debugPath = getDebugPath(debugCtx)
        const id = this._adapter.idFromDefinition(definition, debugPath)
        let meta = this._meta.get(id)

        if(!meta) {
            meta = this._adapter.extractMetaInfo(definition, debugPath)
            debugPath = getDebugPath([debugCtx[0], meta.name])
            const statePaths = new Map()
            const deps = meta.deps
            for(let i = 0; i = deps.length; i++) {
                const dep = deps[i]
                if (dep.path) {
                    statePaths.set(dep.path.join('.'), dep.path)
                }
                const depMeta = this.get(dep.definition, [debugPath, i])
                depMeta.statePaths.forEach(path => statePaths.set(path.join('.'), path))
            }
            meta.statePaths = statePaths.values()
            this._meta.set(id, meta)
        }

        meta.debugPath = getDebugPath([debugCtx[0], meta.name])
        return meta
    }
}
