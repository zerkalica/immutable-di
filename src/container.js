import type {AbstractCursor, PathType} from './cursors/abstract'
import type {DiDefinitionType, DependencyType} from './define'

import {Facet, __pathToIdsMap, __Container} from './define'
import getFunctionName from './utils/get-function-name'

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
        this._notify = ::this._notify

        this._state = state
        this._state.setNotify(this._notify)
    }

    _clear(path: PathType) {
        const idsMap = __pathToIdsMap[path.toString()] || []
        for (let i = 0, j = idsMap.length; i < j; i++) {
            delete this._cache[idsMap[i]]
        }
    }

    _notify(paths: Array<PathType>) {
        for (let i = 0; i < paths.length; i++) {
            this._clear(paths[i])
        }

        const listeners = this._listeners
        for (let i = 0, j = listeners.length; i < j; i++) {
            this.get(listeners[i])
        }
    }

    select(path: PathType, key: ?string) {
        if (!key) {
            /* eslint-disable no-param-reassign */
            key = path.join('.')
            /* eslint-enable no-param-reassign */
        }
        let selector = this._selectorCache[key]
        if (!selector) {
            selector = this._selectorCache[key] = this._state.select(path)
        }
        return selector
    }

    mount(definition: DependencyType) {
        const {id} = definition.__di
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

    _get(definition: DependencyType, tempCache, debugCtx: Array<string>): any {
        if (definition === __Container) {
            return this
        }

        const def = definition.__di
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
                const value = this._get(dep.definition, tempCache, debugCtx.concat([displayName, i]))
                if (isOptions) {
                    args[dep.name] = value
                } else {
                    defArgs.push(value)
                }
            }
            /* eslint-disable new-cap */
            result = isClass
                ? new definition(...defArgs)
                : definition(...defArgs)
            /* eslint-enable new-cap */
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
