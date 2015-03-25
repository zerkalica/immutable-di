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
            const scopes = new Set()
            const deps = meta.deps
            for(let i = 0; i < deps.length; i++) {
                const dep = deps[i]
                if (dep.path && dep.path.length) {
                    scopes.add(dep.path[0])
                } else {
                    const depMeta = this.get(dep.definition, [debugPath, i])
                    depMeta.scopes.forEach(path => scopes.add(path))
                }
            }

            meta.scopes = Array.from(scopes.values())
            meta.scope = meta.scopes.length ? meta.scopes[0] : 'global'
            this._meta.set(id, meta)
        }

        return meta
    }
}
