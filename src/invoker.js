export default class Invoker {
    constructor({metaInfoCache, container, actionType, payload}) {
        this._meta = metaInfoCache
        this._actionType = actionType
        this._payload = payload
        this._container = container
        this._cache = new Map()
    }

    handle(definition, debugCtx) {
        const {id, waitFor, debugPath} = this._meta.get(definition, debugCtx)

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
            .then(depsMutations => this._container.get(definition, debugCtx))
            .then(instance => instance.handle(this._actionType, this._payload))
            .then(data => ({id, data}))

        this._cache.set(id, result)

        return result
    }
}
