import type {AbstractStateAdapter} from './state-adapters/abstract-adapter'
import type {PathType} from './types'
import {__pathToIdsMap} from './define'
import __debug from 'debug'
const debug = __debug('immutable-di:transformer')

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
        const idsMap = __pathToIdsMap.get(path.toString()) || []
        debug('upd path: %s; ids: %s; map: %o', path.toString(), idsMap.toString(), __pathToIdsMap)
        idsMap.forEach(::this._cache.delete)
    }
}
