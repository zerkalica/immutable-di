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

export default class DefinitionDriver {
    constructor(pathMapper) {
        this._pathMapper = pathMapper
    }

    getId(definition) {
        return definition.__di.id
    }

    getDef(definition) {
        if (!definition || !definition.__di) {
            throw new Error('Property .__id not exist in ' + debugCtx)
        }

        return {
            ...definition.__di,
            deps: normalizeDeps(definition.__di.deps, this._pathMapper)
        }
    }
}
