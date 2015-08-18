import {__pathToIdsMap} from './utils/Dep'
import {Facet} from './define'
import AbstractCursor from './cursors/abstract'
import getFunctionName from './utils/getFunctionName'
import type {IDependency} from './utils/Dep'

export default class Container {
    _cache: Map<any> = {}
    _listeners: Array<IDependency> = []
    _affectedPaths = []
    _timerId = null
    _definitionMap = {}

    constructor(state: AbstractCursor) {
        this.get = ::this.get
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this.notify = ::this.notify
        this.__notify = ::this.__notify
        // Store instance of AbstractCursor, our decorators uses them for Setter/Getter factories
        this._cache[AbstractCursor.__di.id] = state
        state.setNotify(this.notify)
    }

    override(fromDefinition: IDependency, toDefinition: IDependency) {
        this._definitionMap[fromDefinition.__di.id] = toDefinition
    }

    _clear(path: string) {
        const idsMap = __pathToIdsMap[path] || []
        for (let i = 0, j = idsMap.length; i < j; i++) {
            delete this._cache[idsMap[i]]
        }
    }

    __notify() {
        const paths = this._affectedPaths
        for (let i = 0; i < paths.length; i++) {
            this._clear(paths[i])
        }

        const listeners = this._listeners
        for (let i = 0, j = listeners.length; i < j; i++) {
            this.get(listeners[i])
        }

        clearTimeout(this._timerId)
        this._affectedPaths = []
        this._timerId = null
    }

    notify(path: string, isSynced: ?bool) {
        this._affectedPaths.push(path)
        if (isSynced) {
            this.__notify()
        } else if (!this._timerId) {
            this._timerId = setTimeout(this.__notify, 0)
        }
    }

    mount(definition: IDependency) {
        // do not call listener on another state change
        this._cache[definition.__di.id] = null
        this._listeners.push(definition)
    }

    unmount(listenerDef: IDependency) {
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(stateMap: object, listener: (v: any) => any, displayName: ?string) {
        const definition = Facet(stateMap, displayName || getFunctionName(listener))((...args) => {
            this.unmount(definition)
            return listener(...args)
        })
        this.mount(definition)
    }

    _get(definition: IDependency, tempCache: object, debugCtx: Array<string>): any {
        if (!definition || !definition.__di) {
            throw new Error('Property .__id not exist in ' + debugCtx)
        }
        const {id, isCachedTemporary} = definition.__di
        const cache = isCachedTemporary ? tempCache : this._cache
        let result = cache[id]
        if (result === undefined) {
            const fn = this._definitionMap[id] || definition
            const {displayName, deps, isClass, isOptions} = fn.__di
            const args = {}
            const defArgs = isOptions ? [args] : []
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const value = this._get(
                    dep.definition,
                    tempCache,
                    debugCtx.concat([displayName, i])
                )
                if (isOptions) {
                    args[dep.name] = value
                } else {
                    defArgs.push(value)
                }
            }
            /* eslint-disable new-cap */
            result = isClass
                ? new fn(...defArgs)
                : fn(...defArgs)
            /* eslint-enable new-cap */
            if (result === undefined) {
                result = null
            }
            cache[id] = result
        }

        return result
    }

    get(definition: IDependency): any {
        return this._get(definition, {}, [])
    }
}
