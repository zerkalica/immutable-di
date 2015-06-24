import type {AbstractCursor, PathType} from './cursors/abstract'
import type {DiDefinitionType, DependencyType} from './define'

import getDebugPath from './utils/get-debug-path'
import convertArgsToOptions from './utils/convert-args-to-options'
import {Class, Factory, __pathToIdsMap} from './define'
import getDef from './define/get'

import __debug from 'debug'
const debug = __debug('immutable-di:container')

@Class()
export default class Container {
    _state: AbstractCursor
    _cache: Array<any> = []
    _async: bool
    _timeOutInProgress: bool = false
    _affectedPaths: Array<PathType> = []
    _listeners: Array<DependencyType> = []

    constructor(state: AbstractCursor, options: {async: ?bool} = {}) {
        this.get = ::this.get
        this.select = ::this.select
        this.once = ::this.once
        this.on = ::this.on
        this.off = ::this.off
        this._clear = ::this._clear
        this._update = ::this._update

        this._state = state
        this._async = options.async === undefined ? true : options.async
        this._state.setUpdate(this._update)
    }

    _clear(path: PathType) {
        const idsMap = __pathToIdsMap[path.toString()] || []
        for (let i = 0, j = idsMap.length; i < j; i++) {
            delete this._cache[idsMap[i]]
        }
    }

    _update(path: PathType) {
        this._affectedPaths.push(path)
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
        const affected = this._affectedPaths
        for (let i = 0, j = affected.length; i < j; i++) {
            this._clear(affected[i])       
        }
        this._affectedPaths = []
        const listeners = this._listeners
        for (let i = 0, j = listeners.length; i < j; i++) {
            this.get(listeners[i])
        }
    }

    select(path: PathType) {
        return this._state.select(path)
    }

    on(stateMap: DiDefinitionType, listener: (v: any) => any, displayName: ?string): DependencyType {
        const listenerDef = Factory(stateMap, displayName)(listener)
        this._listeners.push(listenerDef)

        return listenerDef
    }

    off(listenerDef: DependencyType) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(stateMap: DiDefinitionType, listener: (v: any) => any, displayName: ?string) {
        const listenerDef = this.on(stateMap, (...args) => {
            this.off(listenerDef)
            return listener(...args)
        }, displayName)
    }

    get(definition: DependencyType, tempCache = [], debugCtx: ?Array<string> = []): any {
        if (definition) {
            if (this instanceof definition) {
                return this
            }
        } else {
            throw new Error('Getter is not a definition in ' + debugCtx)
        }

        const def = getDef(definition)
        if (!def) {
            throw new Error('Property .__id not exist in ' + debugCtx)
        }
        const {id, displayName, deps, isClass, isCachedTemporary, isOptions} = def
        const cache = isCachedTemporary ? tempCache : this._cache
        let result = cache[id]
        if (result === undefined) {
            const args = {}
            const defArgs = isOptions ? [args] : []
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const value = dep.path ?
                    this._state.get(dep.path) :
                    this.get(dep.definition, tempCache, debugCtx.concat([displayName, i]))

                if(isOptions) {
                    args[dep.name] = value
                } else {
                    defArgs.push(value)
                }
            }

            result = isClass ? new definition(...defArgs) : definition(...defArgs)
            if (result === undefined) {
                result = null
            }
            cache[id] = result
        }

        return result
    }
}
