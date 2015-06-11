import type {AbstractStateAdapter} from './state-adapters/abstract-adapter'
import type {PathType} from './types'

export default class Transformer {
    _adapter: AbstractStateAdapter
    _affectedPaths: Set<PathType>

    constructor(adapter: AbstractStateAdapter) {
        this._adapter = adapter
        this._affectedPaths = new Set()
    }

    get(path: PathType): any {
        return this._adapter.get(path)
    }

    set(path: PathType, value: any) {
        this._affectedPaths.add(path)
        this._adapter.set(path, value)
    }

    getAffectedPaths(): Array<PathType> {
        return Array.from(this._affectedPaths.values())
    }
}
