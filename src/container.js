import type {AbstractCursor, PathType} from './cursors/abstract'
import type {DiDefinitionType, DependencyType} from './define'

import {Class, Facet, __pathToIdsMap} from './define'
import getFunctionName from './utils/get-function-name'
import getDef from './define/get'

@Class()
export default class Container {
    _state: AbstractCursor
    _cache: Map<any> = {}
    _listeners: Array<DependencyType> = []
    _selectorCache = {}

    constructor(state: AbstractCursor) {
        this.get = ::this.get
        this.select = ::this.select
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this.notify = ::this.notify

        this._state = state
        this._state.setNotify(this.notify)
    }

    _clear(path: PathType) {
        const idsMap = __pathToIdsMap[path.toString()] || []
        for (let i = 0, j = idsMap.length; i < j; i++) {
            delete this._cache[idsMap[i]]
        }
    }

    notify(paths: Array<PathType>) {
        for (let i = 0; i < paths.length; i++) {
            this._clear(paths[i])
        }

        const listeners = this._listeners
        for (let i = 0, j = listeners.length; i < j; i++) {
            this.get(listeners[i])
        }
    }

    select(path, key) {
        let selector = this._selectorCache[key]
        if (!selector) {
            selector = this._selectorCache[key] = this._state.select(path)     
        }
        return selector
    }

    mount(definition: DependencyType) {
        const {id} = getDef(definition)
        // do not call listener on another state change
        this._cache[id] = null
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

    _get(definition: DependencyType, tempCache: object, debugCtx: Array<string>): any {
        if (this instanceof definition) {
            return this
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
                    this.select(dep.path, dep.pathKey).get() :
                    this._get(dep.definition, tempCache, debugCtx.concat([displayName, i]))

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

    get(definition: DependencyType): any {
        if (!definition) {
            throw new Error('Getter is not a definition')
        }

        return this._get(definition, {}, [])
    }
}
