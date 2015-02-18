export default class Container {
    constructor({state, metaInfoCache, globalCache}) {
        const cache = this._cache = new Map()
        cache.set('global', globalCache || new Map())
        cache.set('state', new Map())
        this._meta = metaInfoCache
        this._state = state
        this._locks = new Map()
    }

    get(definition, debugCtx) {
        const {id, deps, debugPath, handler, statePaths} = this._meta.get(definition, debugCtx)
        const cache = this._cache.get(statePaths.length ? 'state' : 'global')
        let result = cache.get(id)
        if (result !== void 0) {
            return result
        }

        if (this._locks.get(id)) {
            throw new Error('Recursive call detected in ' + debugPath);
        }
        this._locks.set(id, true)

        const args = []
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i]
            let value
            if (dep.path.length) {
                value = this._state.getIn(dep.path)
            } else {
                value = this.get(dep.definition, [debugPath, i])
                if (dep.promiseHandler) {
                    value = dep.promiseHandler(value)
                }
            }

            args.push(value)
        }

        result = Promise.all(args).then(resolvedArgs => handler.apply(null, resolvedArgs))

        this._locks.set(id, false)
        cache.set(id, result)

        return result
    }
}
