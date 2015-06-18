import type {AbstractStateAdapter, PathType} from './state-adapters/abstract-adapter'
import Transformer from './transformer'

import getDebugPath from './utils/get-debug-path'
import convertArgsToOptions from './utils/convert-args-to-options'
import {Class, Factory} from './define'
import getDef from './define/get'
import __debug from 'debug'

import {__pathToIdsMap} from './define'

export type ListenerDefType = (v: any) => any

const debug = __debug('immutable-di:container')

@Class()
export default class Container {
    _state: AbstractStateAdapter
    _cache: Map<any>

    constructor(state: AbstractStateAdapter, async: bool = true) {
        this._cache = new Map()
        this._state = state

        this.get = ::this.get
        this.getAsync = ::this.getAsync
        this.select = ::this.select
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount

        this._async = async
        this._timeOutInProgress = false

        this._state.setUpdate(::this._update)
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

    _clear(path) {
        const idsMap = __pathToIdsMap.get(path.toString()) || []
        debug('upd path: %s; ids: %s; map: %o', path.toString(), idsMap.toString(), __pathToIdsMap)
        for (let i = 0; i < idsMap.length; i++) {
            this._cache.delete(idsMap[i])
        }
    }

    _update(path) {
        this._clear(path)
        if (this._async && !this._timeOutInProgress) {
            this._timeOutInProgress = true
            setTimeout(() => {
                this._updateListeners()
                this._timeOutInProgress = false
            }, 0)
        } else {
            this._updateListeners()
        }
    }

    _updateListeners() {
        this._listeners.forEach(listener => this.get(listener))
    }

    select(path) {
        this._state.select(path)
    }

    mount(stateMap: object, listener: ListenerDefType, id: ?string): ListenerDefType {
        const mountedListener = Factory(stateMap, id)(listener)
        this._listeners.push(mountedListener)

        return mountedListener
    }

    unmount(listenerDef: ListenerDefType): Dispatcher {
        this._listeners = this._listeners.filter(d => listenerDef !== d)

        return this
    }

    once(definition: (v: any) => any, listener: (v: any) => any): Dispatcher {
        const listenerDef = this.mount(definition, (...args) => {
            this.unmount(listenerDef)
            return listener(...args)
        })

        return this
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
