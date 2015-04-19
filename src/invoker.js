import {getDef} from './define'
import {getDebugPath} from './utils'

export default class Invoker {
    constructor({container, action, payload}) {
        this._action = action
        this._getPayload = typeof payload === 'function'
            ? (statePath) => payload(statePath)
            : () => payload
        this._container = container
        this._cache = new Map()
    }

    handle(definition, debugCtx) {
        let {id, waitFor, statePath} = getDef(definition)
        waitFor = waitFor || []
        const debugPath = getDebugPath([debugCtx && debugCtx.length ? debugCtx[0] : [], id])
        if(this._cache.has(id)) {
            return this._cache.get(id)
        }

        const args = []
        for (let i = 0, j = waitFor.length; i < j; i++) {
            const dep = waitFor[i]
            const value = this.handle(dep.definition, [debugPath, i])
            args.push(dep.promiseHandler ? dep.promiseHandler(value) : value)
        }
        const result = Promise.all(args)
            .then(() => this._container.get(definition, debugCtx))
            .then(instance => instance.handle(this._action, this._getPayload(statePath)))
            .then(data => ({data, id: statePath}))

         this._cache.set(id, result)

        return result
    }
}
