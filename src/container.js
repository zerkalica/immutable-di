import {cancelAnimationFrame, requestAnimationFrame} from './utils/animationFrame'
import {Facet} from './define'
import {IDep} from './asserts'
import AbstractCursor from './cursors/abstract'
import getFunctionName from './utils/getFunctionName'
import type {IDependency} from './utils/Dep'
import updateIdsMap from './utils/updateIdsMap'

export default class Container {
    _cache: Map<any> = {}
    _listeners: Array<IDependency> = []
    _affectedPaths = []
    _timerId = null
    _definitionMap = {}

    __pathToIdsMap = {}
    __idToPathsMap = {}
    _isSynced = false

    constructor(state: AbstractCursor, options: ?{isSynced: bool}) {
        if (!(state instanceof AbstractCursor)) {
            throw new TypeError('state is not an instance of AbstractCursor: ' + state)
        }
        this.get = ::this.get
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this.notify = ::this.notify
        this.__notify = ::this.__notify
        // Store instance of AbstractCursor, our decorators uses them for Setter/Getter factories
        this._cache[AbstractCursor.__di.id] = state
        state.setNotify(this.notify)
        if (options) {
            this._isSynced = options.isSynced
        }
    }

    override(fromDefinition: IDependency, toDefinition: IDependency) {
        IDep(fromDefinition)
        IDep(toDefinition)
        this._definitionMap[fromDefinition.__di.id] = toDefinition
    }

    _updatePathMap(definition) {
        if (!this.__idToPathsMap[definition.__di.id]) {
            updateIdsMap(definition, this.__pathToIdsMap, this.__idToPathsMap)
        }
    }

    _clear(path: string[]) {
        let key = ''
        for (let j = 0, l = path.length - 1; j <= l; j++) {
            key = key + '.' + path[j]
            const k =  key + (j === l ? '' : '.*')
            const idsMap = this.__pathToIdsMap[k] || []
            for (let i = 0, m = idsMap.length; i < m; i++) {
                delete this._cache[idsMap[i]]
            }
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
        cancelAnimationFrame(this._timerId)
        this._affectedPaths = []
        this._timerId = null
    }

    notify(path: string[], isSynced: ?bool) {
        this._affectedPaths.push(path)
        if (isSynced === undefined ? this._isSynced : isSynced) {
            this.__notify()
        } else if (!this._timerId) {
            this._timerId = requestAnimationFrame(this.__notify)
        }
    }

    mount(definition: IDependency) {
        IDep(definition)
        // do not call listener on another state change
        this._cache[definition.__di.id] = null
        this._updatePathMap(definition)
        this._listeners.push(definition)
    }

    unmount(listenerDef: IDependency) {
        IDep(listenerDef)
        this._cache[listenerDef.__di.id] = null
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
            this._updatePathMap(fn)
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
        IDep(definition)
        return this._get(definition, {}, [])
    }
}
