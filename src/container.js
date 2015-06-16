import type {AbstractStateAdapter, PathType} from './state-adapters/abstract-adapter'
import Transformer from './transformer'

import getDebugPath from './utils/get-debug-path'
import convertArgsToOptions from './utils/convert-args-to-options'
import {Class} from './define'
import getDef from './define/get'
import __debug from 'debug'
const debug = __debug('immutable-di:container')

@Class()
export default class Container {
    _state: AbstractStateAdapter
    _cache: Map<any>

    constructor(state: AbstractStateAdapter, cache: Map<any>) {
        this._cache = cache || new Map()
        this._state = state
        this.get = ::this.get
        this.getAsync = ::this.getAsync
        this.transformState = ::this.transformState
    }

    transformState(transform: (v: Transformer) => any) {
        const transformer = new Transformer(this._state, this._cache)
        transform(transformer)
    }

    _getDepValue(dep, isSync, ctx) {
        let value
        if (dep.path) {
            value = this._state.get(dep.path)
        } else {
            value = dep.isProto
                ? dep.definition
                : this.getAsync(dep.definition, isSync, ctx)

            if (dep.promiseHandler) {
                value = dep.promiseHandler(value)
            }
        }

        return {value, name: dep.name}
    }

    getAsync(definition, isSync, debugCtx) {
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
        const {id, handler, deps, isClass} = def
        const debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id])
        const cache = this._cache
        if (cache.has(id)) {
            return cache.get(id)
        }

        const args = []
        const argNames = []
        for (let i = 0; i < deps.length; i++) {
            const {value, name} = this._getDepValue(deps[i], isSync, [debugPath, i])
            if (name) {
                argNames.push(name)
            }
            args.push(value)
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

    get(definition) {
        return this.getAsync(definition, true)
    }
}
