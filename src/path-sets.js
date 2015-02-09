import MetaInfoCache from './meta-info-cache'

export default class PathSets {
    /**
     * @param  {MetaInfoCache} meta
     */
    constructor (meta) {
        if (!(meta instanceof MetaInfoCache)) {
            throw new Error('meta cache is not an instance of MetaInfoCache')
        }
        this._meta = meta
        this._pathSets = new Map()
        this._pathSetsNormalized = []
        this._handlers = []
    }

    getHandlers() {
        return this._handlers
    }

    add(definition) {
        this._add(definition)
        this._handlers.push(definition)
    }

    remove(definition) {
        this._pathSetsNormalized = []
        this._pathSets.clear()
        const oldHandlers = this._handlers
        this._handlers = []
        for (let i = 0; i < oldHandlers.length; i++) {
            const h =  oldHandlers[i]
            if (h !== definition) {
                this.add(h)
            }
        }
    }

    _add(definition, debugPath, fallbackName) {
        const {deps, id} = this._meta.get(definition, debugPath, fallbackName)
        const pathSets = this._pathSets
        for (let i = 0, j = deps.length; i < j; i++) {
            const {path, type, definition} = deps[i]
            if(type === 'path') {
                const key = path.join(',')
                if(!pathSets.has(key)) {
                    pathSets.set(key, new Map())
                }
                pathSets.get(key).set(id, true)
            } else {
                this._add(definition, debugPath, i)
            }
        }
    }

    get() {
        if (!this._pathSetsNormalized.length) {
            for (let [pathKey, ids] of this._pathSets) {
                this._pathSetsNormalized.push({
                    path: pathKey.split(','),
                    ids: ids.keys()
                })
            }
        }

        return this._pathSetsNormalized
    }
}
