import {cancelAnimationFrame, requestAnimationFrame} from './utils/animationFrame'
import {IDep} from './asserts'
import AbstractCursor from './cursors/abstract'
import getFunctionName from './utils/getFunctionName'
import type {IDependency} from './utils/Dep'
import DefaultDefinitionDriver from './drivers/DefaultDefinitionDriver'
import MetaLoader from './utils/MetaLoader'

export default class Container {
    _cache: Map<any> = {}
    _listeners: Array<IDependency> = []
    _affectedPaths = []
    _timerId = null
    _definitionMap = {}

    _isSynced = false

    constructor(state: AbstractCursor, options: ?{isSynced: bool}) {
        if (!(state instanceof AbstractCursor)) {
            throw new TypeError('state is not an instance of AbstractCursor: ' + state)
        }

        const driver = new DefaultDefinitionDriver()
        this._annotations = DefaultDefinitionDriver.annotations
        this._loader = new MetaLoader(driver)

        this.get = ::this.get
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this.notify = ::this.notify
        this.__notify = ::this.__notify
        // Store instance of AbstractCursor, our decorators uses them for Setter/Getter factories
        this._cache[this._getMeta(this._annotations.Class()(AbstractCursor)).id] = state
        state.setNotify(this.notify)
        if (options) {
            this._isSynced = options.isSynced
        }
    }

    _getMeta(def, debugCtx) {
        return this._loader.getMeta(def, debugCtx)
    }

    override(fromDefinition: IDependency, toDefinition: IDependency) {
        IDep(fromDefinition)
        IDep(toDefinition)
        this._definitionMap[this._getMeta(fromDefinition).id] = this._getMeta(toDefinition)
    }

    _clear(path: string[]) {
        let key = ''
        const pathToIdsMap = this._loader.pathToIdsMap
        for (let j = 0, l = path.length - 1; j <= l; j++) {
            key = key + '.' + path[j]
            const k =  key + (j === l ? '' : '.*')
            const idsMap = pathToIdsMap[k] || []
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
        this._cache[this._getMeta(definition).id] = null
        this._listeners.push(definition)
    }

    unmount(listenerDef: IDependency) {
        IDep(listenerDef)
        this._cache[this._getMeta(listenerDef).id] = null
        this._listeners = this._listeners.filter(d => listenerDef !== d)
    }

    once(stateMap: object, listener: (v: any) => any) {
        const unmount = this.unmount
        let definition

        function listenerWrapper(...args) {
            unmount(definition)
            return listener(...args)
        }

        listenerWrapper.displayName = 'listenerOnce@' + getFunctionName(listener)
        definition = this._annotations.Facet(stateMap)(listenerWrapper)

        this.mount(definition)
    }

    _get(definition: IDependency, tempCache: object, debugCtx: Array<string>): any {
        const def = this._getMeta(definition, debugCtx)
        const {id, isCachedTemporary, displayName} = def
        const cache = isCachedTemporary ? tempCache : this._cache
        let result = cache[id]
        if (result === undefined) {
            const mappedDef = this._definitionMap[id] || def
            const {deps, isClass, isOptions, fn} = mappedDef
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
