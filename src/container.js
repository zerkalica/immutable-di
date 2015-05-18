import {getDebugPath, convertArgsToOptions} from './utils'
import {Class, getDef} from './define'

export default class Container {
    constructor({state, globalCache}) {
        const cache = this._cache = new Map()
        cache.set('global', globalCache || new Map())
        this._state = state

        this.get = this.get.bind(this)
        this.getSync = this.getSync.bind(this)
        this.clear = this.clear.bind(this)
    }

    _getScope(scope) {
        let cache
        if (!this._cache.has(scope)) {
            cache = new Map()
            this._cache.set(scope, cache)
        } else {
            cache = this._cache.get(scope)
        }
        return cache
    }

    update(transform) {
        const updatedIds = this._state.transformState(transform)
        updatedIds.forEach(path => this._getScope(path[0]).clear())
        return updatedIds
    }

    _getDepValue(dep, isSync, debugPath) {
        let value
        if (dep.path) {
            value = this._state.getIn(dep.path)
        } else {
            value = dep.isProto
                ? dep.definition
                : this.get(dep.definition, isSync, [debugPath, i])

            if (dep.promiseHandler) {
                value = dep.promiseHandler(value)
            }
        }

        return {value, name: dep.name}
    }

    get(definition, isSync, debugCtx) {
        if (definition) {
            if (this instanceof definition) {
                return this
            }
        } else {
            throw new Error('Getter is not a definition in ' + getDebugPath(debugCtx || []))
        }

        const def = getDef(definition)
        if (!def) {
            throw new Error('Property .__id not exist in ' + getDebugPath(debugCtx || []))
        }
        const {id, handler, deps, scope, isClass} = def
        const debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id])
        const cache = this._getScope(scope)
        if (cache.has(id)) {
            return cache.get(id)
        }

        const args = []
        const argNames = []
        for (let i = 0; i < deps.length; i++) {
            const {value, name} = this._getDepValue(deps[i], isSync, debugPath)
            if (name) {
                argNames.push(name)
            }
        }

        function createIntance(resolvedArgs) {
            const defArgs = argNames.length
                ? [convertArgsToOptions(resolvedArgs, argNames)]
                : resolvedArgs

            return isClass
                ? new definition(...defArgs)
                : definition(...defArgs)
        }

        const result = isSync
            ? createIntance(args)
            : Promise.all(args).then(createIntance)

        cache.set(id, result)

        return result
    }

    getSync(definition) {
        return this.get(definition, true)
    }
}
Class(Container)
