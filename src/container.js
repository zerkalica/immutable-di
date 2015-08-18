import type {AbstractCursor, PathType} from './cursors/abstract'
import type {DiDefinitionType, DependencyType} from './define'
import {Facet, __pathToIdsMap, __Container} from './define'
import getFunctionName from './utils/get-function-name'

export default class Container {
    _state: AbstractCursor
    _cache: Map<any> = {}
    _listeners: Array<DependencyType> = []
    _affectedPaths = []
    _lastDep = null
    _timerId = null
    _debugSelector = null

    constructor(state: AbstractCursor, options: ?{
        enableDebug: bool,
        debugPath: PathType
    }) {
        this.get = ::this.get
        this.select = ::this.select
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this._notify = ::this._notify
        this.__notify = ::this.__notify

        this._state = state
        this._state.setNotify(this._notify)
        if (options && options.enableDebug) {
            const debugPath = options.debugPath || ['__debug']
            this.select(debugPath).set({
                affected: []
            }).commit()
            this._debugSelector = this.select(debugPath.concat('affected'))
        }
    }

    _clear(path: PathType) {
        const idsMap = __pathToIdsMap[path.toString()] || []
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
        if (this._debugSelector && this._lastDep) {
            this._debugSelector.get().push({...this._lastDep, paths})
        }

        clearTimeout(this._timerId)
        this._affectedPaths = []
        this._timerId = null
    }

    _notify(path, isSynced) {
        this._affectedPaths.push(path)
        if (isSynced) {
            this.__notify()
        } else if (!this._timerId) {
            this._timerId = setTimeout(this.__notify, 0)
        }
    }

    select(path: PathType) {
        return this._state.select(path)
    }

    mount(definition: DependencyType) {
        // do not call listener on another state change
        this._cache[definition.__di.id] = null
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
        const {id, displayName, deps, isClass, isCachedTemporary, isOptions, isAction} = def
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
            if (this._debugSelector && isAction) {
                result = this._debugFactoryResult({id, displayName}, result)
            }
            cache[id] = result
        }

        return result
    }

    _debugFactoryResult({id, displayName}, depResult) {
        if (typeof depResult === 'function') {
            const self = this
            return function wrappedDepResult(...args) {
                self._lastDep = {
                    id,
                    displayName,
                    args
                }
                return depResult(...args)
            }
        }

        return depResult
    }

    get(definition: DependencyType): any {
        if (!definition) {
            throw new Error('Getter is not a definition')
        }

        return this._get(definition, {}, [])
    }
}
