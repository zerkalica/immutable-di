import type {AbstractCursor, PathType} from './cursors/abstract'
import type {DiDefinitionType, DependencyType} from './define'

import {Class, Facet, __pathToIdsMap} from './define'
import getFunctionName from './utils/get-function-name'
import getDef from './define/get'

@Class()
export default class Container {
    _state: AbstractCursor
    _cache: Map<any> = {}
    _async: bool
    _timeOutInProgress: bool = false
    _affectedPaths: Array<PathType> = []
    _listeners: Array<DependencyType> = []

    constructor(state: AbstractCursor, options: {async: ?bool} = {}) {
        this.get = ::this.get
        this.select = ::this.select
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
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

    mount(definition: DependencyType) {
        this._listeners.push(definition)
    }

    unmount(listenerDef: DependencyType) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(stateMap: DiDefinitionType, listener: (v: any) => any, displayName: ?string) {
        const definition = Facet(stateMap, displayName || getFunctionName(listener))((...args) => {
            this.unmount(definition)
            return listener(...args)
        })
        this.mount(definition)
    }

    get(definition: DependencyType, tempCache = {}, debugCtx: ?Array<string> = []): any {
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
