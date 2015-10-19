import {cancelAnimationFrame, requestAnimationFrame} from './utils/animationFrame'
import {IDep} from './asserts'
import BaseAnnotations from './model/BaseAnnotations'
import defaultAnnotations from './define'
import getFunctionName from './utils/getFunctionName'
import MetaLoader from './utils/MetaLoader'
import NativeCursor from './cursors/NativeCursor'
import Selector from './model/Selector'
import type {IDependency} from './utils/Dep'

import type {
    IStateSpec,
    IValidatorCreate
} from './model/Selector'

export default class Container {
    _cache: Map<any> = {}
    _listeners: Array<IDependency> = []
    _timerId = null
    _definitionMap = {}

    constructor({
        createValidator,
        cursor,
        annotations,
        isSynced,
        stateSpec,
        middlewares
    }: {
        createValidator: ?IValidatorCreate<TSchema>,
        cursor: ?AbstractCursor,
        annotations: ?BaseAnnotations,
        isSynced: ?bool,
        stateSpec: IStateSpec,
        middlewares: ?Array<func>
    }) {
        if (!stateSpec) {
            throw new TypeError('Need stateSpec')
        }
        this._annotations = annotations || defaultAnnotations
        const loader = new MetaLoader(this._annotations.driver, middlewares || [])
        this._getMeta = loader.getMeta
        this._pathToIdsMap = loader.pathToIdsMap
        this._isSynced = !!isSynced

        this.get = ::this.get
        this.once = ::this.once
        this.mount = ::this.mount
        this.unmount = ::this.unmount
        this.notify = ::this.notify
        this.__notify = ::this.__notify

        const selector = Selector({
            stateSpec,
            createValidator,
            Cursor: cursor || NativeCursor,
            notify: this.notify
        })

        this._setCache(this._annotations.Factory()(Selector), selector)
    }

    _setCache(fn, instance) {
        if (!fn) {
            throw new Error('fn is undefined')
        }
        this._cache[this._getMeta(fn).id] = {
            result: instance,
            prevArgs: {}
        }
    }

    override(fromDefinition: IDependency, toDefinition: IDependency) {
        IDep(fromDefinition)
        IDep(toDefinition)
        this._definitionMap[this._getMeta(fromDefinition).id] = this._getMeta(toDefinition)
    }

    __notify() {
        const listeners = this._listeners
        for (let i = 0, j = listeners.length; i < j; i++) {
            this.get(listeners[i])
        }
        cancelAnimationFrame(this._timerId)
        this._timerId = null
    }

    notify(isSynced: ?bool) {
        if (isSynced === undefined ? this._isSynced : isSynced) {
            this.__notify()
        } else if (!this._timerId) {
            this._timerId = requestAnimationFrame(this.__notify)
        }
    }

    mount(listenerDef: IDependency) {
        IDep(listenerDef)
        // do not call listener on another state change
        this._setCache(listenerDef, null)
        this._listeners.push(listenerDef)
    }

    unmount(listenerDef: IDependency) {
        IDep(listenerDef)
        this._setCache(listenerDef, null)
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

        let cacheRec = cache[id]
        if (!cacheRec) {
            cache[id] = {
                result: undefined,
                prevArgs: {}
            }
            cacheRec = cache[id]
        }
        const prevArgs = cacheRec.prevArgs

        const {deps, isClass, isOptions, fn} = this._definitionMap[id] || def
        const defArgs = isOptions ? [{}] : []
        let isChanged = cacheRec.result === undefined && deps.length === 0
        for (let i = 0, j = deps.length; i < j; i++) {
            const dep = deps[i]
            const value = this._get(
                dep.definition,
                tempCache,
                debugCtx.concat([displayName, i])
            )
            if (isOptions) {
                defArgs[0][dep.name] = value
            } else {
                defArgs.push(value)
            }
            if (prevArgs[i] !== value) {
                isChanged = true
                prevArgs[i] = value
            }
        }

        if (isChanged) {
            /* eslint-disable new-cap */
            cacheRec.result = isClass ? new fn(...defArgs) : fn(...defArgs)
            /* eslint-enable new-cap */
        }

        return cacheRec.result
    }

    get(definition: IDependency): any {
        IDep(definition)
        return this._get(definition, {}, [])
    }
}
