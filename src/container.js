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
    _cache: Map<any>
    _async: bool
    _timeOutInProgress: bool
    _affectedPaths: Array<PathType>

    constructor(state: AbstractCursor, options: {async: bool}) {
        this._cache = new Map()
        this._state = state

        this.get = ::this.get
        this.select = ::this.select
        this.once = ::this.once
        this.on = ::this.on
        this.off = ::this.off

        this._clear = ::this._clear
        this._update = ::this._update

        this._async = options.async === undefined ? true : options.async
        this._timeOutInProgress = false
        this._affectedPaths = []

        this._state.setUpdate(this._update)
    }

    _clear(path: PathType) {
        const idsMap = __pathToIdsMap.get(path.toString()) || []
        debug('upd path: %s; ids: %s; map: %o', path.toString(), idsMap.toString(), __pathToIdsMap)
        for (let i = 0; i < idsMap.length; i++) {
            this._cache.delete(idsMap[i])
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
        this._affectedPaths.forEach(this._clear)
        this._affectedPaths = []
        this._listeners.forEach(this.get)
    }

    select(path: PathType) {
        return this._state.select(path)
    }

    on(stateMap: DiDefinitionType, listener: (v: any) => any, id: ?string): DependencyType {
        const listenerDef = Factory(stateMap, id)(listener)
        this._listeners.push(listenerDef)

        return listenerDef
    }

    off(listenerDef: DependencyType) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(definition: DependencyType, listener: (v: any) => any) {
        const listenerDef = this.on(definition, (...args) => {
            this.off(listenerDef)
            return listener(...args)
        })
    }

    _getDepValue(dep: DependencyType, ctx: Array<string>): any {
        return dep.path ?
            this._state.get(dep.path) :
            this.get(dep.definition, ctx)
    }

    get(definition: DependencyType, debugCtx: ?Array<string>): any {
        if (definition) {
            if (this instanceof definition) {
                return this
            }
        } else {
            throw new Error('Getter is not a definition in ' + getDebugPath(debugCtx || []))
        }

        const cache = this._cache
        const def = getDef(definition)
        if (!def) {
            throw new Error('Property .__id not exist in ' + getDebugPath(debugCtx || []))
        }
        const {id, handler, deps, isClass} = def
        const debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id])
        if (cache.has(id)) {
            return cache.get(id)
        }

        const args = []
        const argNames = []
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i]
            const value = this._getDepValue(dep, [debugPath, i])
            if (dep.name) {
                argNames.push(dep.name)
            }
            args.push(value)
        }

        const defArgs = argNames.length ?
            [convertArgsToOptions(resolvedArgs, argNames)] :
            resolvedArgs

        result = isClass ? new definition(...defArgs) : definition(...defArgs)

        cache.set(id, result)

        return result
    }
}
