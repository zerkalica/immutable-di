import {getDebugPath} from './utils'

export default class MetaInfoCache {
    constructor(adapter) {
        this._adapter = adapter
    }

    get(definition, debugCtx) {
        debugCtx = debugCtx || []
        let debugPath = getDebugPath(debugCtx)
        let meta = definition ? definition.__di_meta : void 0

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
            definition.__di_meta = meta
        }

        return meta
    }
}
