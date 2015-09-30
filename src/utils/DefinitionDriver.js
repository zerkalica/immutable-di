import getFunctionName from './getFunctionName'

function normalizeDeps(deps, pathMapper) {
    const resultDeps = []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length
    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        resultDeps.push({
            name,
            definition: Array.isArray(dep) ? pathMapper(dep) : dep
        })
    }

    return resultDeps
}

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

export default class DefinitionDriver {
    constructor(pathMapper) {
        this._pathMapper = pathMapper
    }

    static add(fn, definition) {
        if (!fn.__di) {
            let id = definition.id
            if (!id) {
                id = _createId()
            } else if (typeof id === 'string') {
                id = _idFromString(id)
            }

            const displayName = definition.displayName || fn.displayName || getFunctionName(fn) || 'id@' + id
            fn.__di = {...definition, id, displayName}
            fn.displayName = displayName
        }
        return fn
    }

    getId(fn, debugCtx) {
        if (!fn || !fn.__di) {
            throw new Error('Property .__id not exist in ', debugCtx)
        }

        return fn.__di.id
    }

    getMeta(fn, debugCtx) {
        const id = this.getId(fn, debugCtx)
        const def = fn.__di
        const deps = def.deps || []
        return {
            ...def,
            fn,
            id,
            isOptions: !Array.isArray(deps),
            deps: normalizeDeps(deps, this._pathMapper)
        }
    }
}
