export default class Invoker {
    constructor({metaInfoCache, container, actionType, payload}) {
        this._meta = metaInfoCache
        this._actionType = actionType
        this._payload = payload
        this._container = container
        this._cache = new Map()
    }

    invoke(definition, debugCtx) {
        const {id, waitFor, debugPath} = this._meta.get(definition, debugCtx)

        if(this._cache.has(id)) {
            return this._cache.get(id)
        }
        const args = []
        for (let i = 0, j = waitFor.length; i < j; i++) {
            const dep = waitFor[i]
            args.push(dep.promiseHandler(this.invoke(dep.definition, [debugPath, i])))
        }

        const result = Promise.all(args).then((depsMutations) => {
            const instance = this._container.get(definition, debugCtx)

            return (new Promise((resolve, reject) => {
                try {
                    resolve(instance.handle(this._actionType, this._payload))
                } catch(e) {
                    reject(e)
                }
            }))
            .then(data => {
                return depsMutations.reduce((mutations, mutation) => {
                    return mutation ? mutations.concat(mutation) : mutations
                }, data ? [data] : [])
            })
        })

        this._cache.set(id, result)

        return result
    }
}
