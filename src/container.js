import Invoker from './invoker'
import {bindAll, convertArgsToOptions} from './utils'

export default class Container {
    static __class = ['Container']

    constructor({state, metaInfoCache, globalCache}) {
        const cache = this._cache = new Map()
        cache.set('global', globalCache || new Map())
        this._meta = metaInfoCache
        this._state = state
        this._locks = new Map()
        bindAll(this)
    }

    factory(name, deps, fn) {
        return this._meta.factory(name, deps, fn)
    }

    clear(scope) {
        this._getScope(scope).clear()
    }

    _getScope(scope) {
        let cache = this._cache.get(scope)
        if (cache === void 0) {
            cache = new Map()
            this._cache.set(scope, cache)
        }
        return cache
    }

    transformState(mutations) {
        const updatedScopes = this._state.transformState(mutations)
        updatedScopes.forEach(scope => this.clear(scope))
    }

    createMethod(actionType, payload) {
        const getPayload = payload === void 0 ? (id => this._state.get(id)) : (id => this._payload)

        return new Invoker({
            metaInfoCache: this._meta,
            container: this,
            actionType,
            getPayload
        })
    }

    get(definition, debugCtx) {
        if (definition && this instanceof definition) {
            return this
        }
        const {id, deps, debugPath, handler, statePaths} = this._meta.get(definition, debugCtx)
        //@todo think about scopes
        const scope = statePaths.length ? statePaths[0][0] : 'global'
        const cache = this._getScope(scope)
        let result = cache.get(id)
        if (result !== void 0) {
            return result
        }

        if (this._locks.get(id)) {
            throw new Error('Recursive call detected in ' + debugPath);
        }
        this._locks.set(id, true)
        const args = []
        const argNames = []
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i]
            let value
            if (dep.path.length) {
                try {
                    value = this._state.getIn(dep.path)
                    if (value === void 0) {
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
