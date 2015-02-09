import MetaInfoCache from './meta-info-cache'
import PathSets from './path-sets'
import {isPromise, getDebugPath} from './utils'
import Promise from 'bluebird'

export default class Container {
    /**
     * @param  {StateAdapter} state
     */
    constructor(state) {
        this._cache = new Map()
        this._locks = new Map()
        const meta = this._meta = new MetaInfoCache()
        this._pathSets = new PathSets(meta)
        this._state = state
    }

    attach(definition) {
        this._pathSets.add(definition)
    }

    remove(definition) {
        this._pathSets.remove(definition)
    }

    _setState(newState) {
        let isUpdated = false
        if(this._state.isEqual(newState)) {
            return false
        }

        this._pathSets.get().forEach(({path, ids}) => {
            if(!this._state.isEqualIn(newState, path)) {
                isUpdated = true
                for(let j = 0; j < ids.length; j++) {
                    this._cache.delete(ids[j])
                }
            }
        })
        this._state.set(newState)
        return isUpdated
    }

    transformState(transform) {
        const newState = this._state.transform(transform)
        return this._setState(newState)
    }

    invokeHandlers() {
        this._pathSets.getHandlers().forEach(handler => this.get(handler))
    }

    get(definition, debugPath, fallbackName) {
        const {id, deps, name, handler} = this._meta.get(definition, debugPath, fallbackName)

        let result = this._cache.get(id)
        if (result !== void 0) {
            return result
        }

        if (this._locks.get(id)) {
            throw new Error('Recursive call detected in ' + getDebugPath(debugPath, name));
        }
        this._locks.set(id, true)

        const args = []
        let hasPromise = false
        for (let i = 0, j = deps.length; i < j; i++) {
            const dep = deps[i]
            let value
            switch (dep.type) {
                case 'path':
                    value = this._state.getIn(dep.path)
                    break
                case 'promise':
                    value = dep.promiseHandler(this.get(dep.definition, debugPath, i))
                    break
                default:
                    value = this.get(dep.definition, debugPath, i)
                    break
            }
            if (isPromise(value)) {
                hasPromise = true
            }

            args.push(value)
        }

        if (hasPromise) {
            result = Promise.all(args).spread(handler)
        } else {
            result = handler.apply(null, args) || null
        }

        this._locks.set(id, false)
        this._cache.set(id, result)

        return result
    }
}
