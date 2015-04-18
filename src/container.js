import Invoker from './invoker'
import {bindAll, getDebugPath, classToFactory, convertArgsToOptions} from './utils'
import {Class, getDef} from './define'

export default class Container {
    constructor({state, globalCache}) {
        const cache = this._cache = new Map()
        cache.set('global', globalCache || new Map())
        this._state = state
        this._locks = new Map()
        bindAll(this)
    }

    clear(scope) {
        this._getScope(scope).clear()
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

    transformState(mutations) {
        const updatedScopes = this._state.transformState(mutations)
        updatedScopes.forEach(scope => this.clear(scope))
    }

    createMethod(actionType, payload) {
        const getPayload = payload === undefined
            ? id => this._state.get(id)
            : () => this._payload

        return new Invoker({
            container: this,
            actionType,
            getPayload
        })
    }

    get(definition, debugCtx) {
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
        const {id, handler, deps, scope} = def
        const debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id])
        const cache = this._getScope(scope)
        let result = cache.get(id)
        if (result !== undefined) {
            return result
        }

        if (this._locks.get(id)) {
            throw new Error('Recursive call detected in ' + debugPath)
        }
        this._locks.set(id, true)
        const args = []
        const argNames = []
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i]
            let value
            if (dep.path) {
                try {
                    value = this._state.getIn(dep.path)
                    if (value === undefined) {
                        throw new Error('Value is undefined')
                    }
                } catch (e) {
                    e.message = e.message + ' in ' + debugPath + ' [' + dep.path.join('.') + ']'
                    throw e
                }
            } else {
                value = this.get(dep.definition, [debugPath, i])
                if (dep.promiseHandler) {
                    value = dep.promiseHandler(value)
                }
            }

            args.push(value)
            if (dep.name) {
                argNames.push(dep.name)
            }
        }

        result = Promise.all(args).then(resolvedArgs => argNames.length
            ? handler(convertArgsToOptions(resolvedArgs, argNames))
            : handler.apply(null, resolvedArgs)
        )

        this._locks.set(id, false)
        cache.set(id, result)

        return result
    }
}
Class(Container)
