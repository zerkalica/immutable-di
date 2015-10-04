import getFunctionName from '../utils/getFunctionName'
import AbstractDefinitionDriver from './AbstractDefinitionDriver'

let _lastId = 1
const _ids = {}
function _createId() {
    return _lastId++
}

function _idFromString(dn) {
    if (!_ids[dn]) {
        _ids[dn] = _createId()
    }

    return _ids[dn]
}

export default class DefaultDefinitionDriver extends AbstractDefinitionDriver {
    add(fn, definition) {
        if (!fn.__di) {
            let id = definition.id
            if (!id) {
                id = _createId()
            } else if (typeof id === 'string') {
                id = _idFromString(id)
            }

            const displayName = definition.displayName || fn.displayName || getFunctionName(fn) || 'id@' + id
            fn.__di = {
                ...definition,
                id,
                displayName
            }
            fn.displayName = displayName
        }
        return fn
    }

    getId(fn, debugCtx) {
        if (!fn || !fn.__di) {
            throw new Error('Property .__di not exist in ' + fn)
        }

        return fn.__di.id
    }

    _normalizeDeps(deps, debugCtx) {
        const resultDeps = []
        const isArray = Array.isArray(deps)
        const names = isArray ? [] : Object.keys(deps)
        const len = isArray ? deps.length : names.length
        const {Path, Cursor} = this._annotations
        for (let i = 0; i < len; i++) {
            const name = names.length ? names[i] : undefined
            const key = name || i
            const dep = deps[key]
            let definition
            if (Array.isArray(dep)) {
                definition = Path(dep)
            } else if (dep.$path) {
                if (!Array.isArray(dep.$path)) {
                    throw new Error(
                        'Path not found in ' + JSON.stringify(dep)
                        + ': ' + debugCtx.concat(key)
                    )
                }
                definition = Cursor(dep.$path)
            } else if (dep.$) {
                if (!Array.isArray(dep.$.$path)) {
                    throw new Error('Model not registered in stateSpec: ' + debugCtx.concat(key))
                }
                definition = Path(dep.$.$path)
            } else {
                definition = dep
            }

            resultDeps.push({
                name,
                definition
            })
        }

        return resultDeps
    }

    getMeta(fn, debCtx) {
        const debugCtx = (debCtx || []).concat('@' + fn.displayName)
        const id = this.getId(fn, debugCtx)
        const def = fn.__di
        const deps = def.deps || []
        return {
            ...def,
            fn,
            id,
            isOptions: !Array.isArray(deps),
            deps: this._normalizeDeps(deps, debugCtx)
        }
    }
}
