import type {AbstractStateAdapter} from './state-adapters/abstract-adapter'
import type {PathType} from './types'
import {__pathToIdsMap} from './define'

export default class Transformer {
    _adapter: AbstractStateAdapter
    _cache: Map<string>

    constructor(adapter: AbstractStateAdapter, cache: Map<string>) {
        this._adapter = adapter
        this._cache = cache
    }

    get(path: PathType): any {
        return this._adapter.get(path)
    }

    set(path: PathType, value: any) {
        this._adapter.set(path, value)

        const parts = []
        for (let i = 0; i < path.length; i++) {
            parts.push(path[i])
            const pathMap = __pathToIdsMap.get(parts.toString()) || []
            pathMap.forEach(id => this._cache.delete(id))
        }
    }
}
